// models/Lab.js
import pool from '../config/database.js';
import Class from './Class.js';

/** Helpers to sanitize incoming data from the frontend */
const toIntOrNull = (v) => {
  if (v === '' || v === undefined || v === null) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};
const toTextArray = (v) => {
  if (Array.isArray(v)) return v.map(String);
  if (v === '' || v === undefined || v === null) return [];
  return [String(v)];
};

export class Lab {
  static async createTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS labs (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL DEFAULT '',
        capacity INTEGER DEFAULT 0,
        resources TEXT[] DEFAULT '{}',
        subject_id INTEGER,
        department_id INTEGER,
        teacher INTEGER,
        room VARCHAR(50) DEFAULT '',
        day VARCHAR(20) DEFAULT '',
        time_slot VARCHAR(20) DEFAULT '',
        max_students INTEGER DEFAULT 30,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    await pool.query(query);
  }

  static async findById(id) {
    const result = await pool.query('SELECT * FROM labs WHERE id = $1', [Number(id)]);
    return result.rows[0] || null;
  }

  static async getSubjectDetails(subjectId) {
    if (!subjectId) return null;
    const result = await pool.query(
      'SELECT id, name, department_id FROM subjects WHERE id = $1',
      [Number(subjectId)]
    );
    return result.rows[0] || null;
  }

  static async syncNamesWithSubjects() {
    try {
      await pool.query(`
        UPDATE labs AS l
        SET name = s.name
        FROM subjects AS s
        WHERE l.subject_id = s.id
          AND s.name IS NOT NULL
          AND s.name <> ''
          AND (l.name IS DISTINCT FROM s.name)
      `);
    } catch (error) {
      console.error('Failed to synchronize lab names with subject names:', error);
    }
  }

  static async getAll() {
    const result = await pool.query('SELECT * FROM labs ORDER BY name');
    return result.rows;
  }

  static async create(labData) {
    const {
      capacity = 0,
      resources = [],
      subject_id = null,
      department_id = null,
      teacher = null,
      room = '',
      day = '',
      time_slot = '',
      max_students = 30,
    } = labData;

    const subjectId = toIntOrNull(subject_id);
    if (!subjectId) {
      const err = new Error('Subject is required for a lab session');
      err.status = 400;
      throw err;
    }

    const subjectDetails = await Lab.getSubjectDetails(subjectId);
    if (!subjectDetails) {
      const err = new Error('Selected subject does not exist');
      err.status = 400;
      throw err;
    }

    const finalName = subjectDetails.name;
    const finalDepartmentId = toIntOrNull(department_id) ?? toIntOrNull(subjectDetails.department_id);

    const teacherId = toIntOrNull(teacher);

    // Prevent teacher conflict on same day and time_slot
    if ((teacherId !== null || teacher) && day && time_slot) {
      const conflict = await Lab.hasConflict({
        teacher,
        teacher_id: teacherId,
        day,
        time_slot,
        excludeTable: 'labs'
      });
      if (conflict) {
        const err = new Error('SCHEDULE_CONFLICT: Teacher already has a class or lab at this time');
        err.status = 400;
        throw err;
      }
    }
    const query = `
      INSERT INTO labs (
        name, capacity, resources, subject_id, department_id,
        teacher, room, day, time_slot, max_students
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
      RETURNING *
    `;
    const values = [
      String(finalName ?? ''),
      Number.isFinite(Number(capacity)) ? Number(capacity) : 0,
      toTextArray(resources),
      subjectId,
      finalDepartmentId,
      toIntOrNull(teacher),
      String(room ?? ''),
      String(day ?? ''),
      String(time_slot ?? ''),
      Number.isFinite(Number(max_students)) ? Number(max_students) : 30,
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async update(id, labData) {
    const {
      capacity = 0,
      resources = [],
      subject_id = null,
      department_id = null,
      teacher = null,
      room = '',
      day = '',
      time_slot = '',
      max_students = 30,
    } = labData;

    const existingLab = await Lab.findById(id);
    if (!existingLab) {
      return null;
    }

    const providedSubjectId = toIntOrNull(subject_id);
    const subjectId = providedSubjectId ?? toIntOrNull(existingLab.subject_id);

    let subjectDetails = null;
    if (subjectId) {
      subjectDetails = await Lab.getSubjectDetails(subjectId);
      if (!subjectDetails) {
        const err = new Error('Selected subject does not exist');
        err.status = 400;
        throw err;
      }
    } else {
      const err = new Error('Subject is required for a lab session');
      err.status = 400;
      throw err;
    }

    const finalName = subjectDetails.name;
    const finalDepartmentId =
      toIntOrNull(department_id) ??
      toIntOrNull(subjectDetails.department_id) ??
      toIntOrNull(existingLab.department_id);

    const teacherId = toIntOrNull(teacher);

    // Prevent teacher conflict on same day and time_slot (exclude current id)
    if ((teacherId !== null || teacher) && day && time_slot) {
      const conflict = await Lab.hasConflict({
        teacher,
        teacher_id: teacherId,
        day,
        time_slot,
        excludeId: id,
        excludeTable: 'labs'
      });
      if (conflict) {
        const err = new Error('SCHEDULE_CONFLICT: Teacher already has a class or lab at this time');
        err.status = 400;
        throw err;
      }
    }
    const query = `
      UPDATE labs
      SET name = $1, capacity = $2, resources = $3, subject_id = $4,
          department_id = $5, teacher = $6, room = $7, day = $8,
          time_slot = $9, max_students = $10
      WHERE id = $11
      RETURNING *
    `;
    const values = [
      String(finalName ?? ''),
      Number.isFinite(Number(capacity)) ? Number(capacity) : 0,
      toTextArray(resources),
      subjectId,
      finalDepartmentId,
      toIntOrNull(teacher),
      String(room ?? ''),
      String(day ?? ''),
      String(time_slot ?? ''),
      Number.isFinite(Number(max_students)) ? Number(max_students) : 30,
      Number(id),
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async hasConflict({
    teacher,
    teacher_id,
    day,
    time_slot,
    excludeId = null,
    excludeTable = null
  }) {
    if (!day || !time_slot) {
      return false;
    }

    const teacherId = teacher_id ?? toIntOrNull(teacher);
    const teacherName = !teacherId && typeof teacher === 'string' ? teacher.trim() : null;

    if (!teacherId && !teacherName) {
      return false;
    }

    if (teacherId) {
      let query = `SELECT 1 FROM labs WHERE day = $1 AND time_slot = $2 AND teacher = $3`;
      const params = [day, time_slot, teacherId];

      if (excludeId && excludeTable === 'labs') {
        query += ` AND id != $4`;
        params.push(excludeId);
      }

      query += ' LIMIT 1';

      try {
        const result = await pool.query(query, params);
        if (result.rows.length > 0) {
          return true;
        }
      } catch (error) {
        console.error('Error checking lab conflicts:', error);
      }
    }

    const classConflict = await Class.hasConflict({
      teacher: teacherName,
      teacher_id: teacherId,
      day,
      time_slot,
      excludeId,
      excludeTable: 'labs'
    });

    return classConflict;
  }

  static async delete(id) {
    const query = 'DELETE FROM labs WHERE id = $1';
    await pool.query(query, [id]);
  }
}

export default Lab;
