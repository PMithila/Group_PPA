import pool from '../config/database.js';
import { User } from './User.js';

const normalizeRole = (role) => (role || '').toLowerCase();

const resolveTeacherDetails = async ({ teacherId, teacherName, teacherEmail }) => {
  let resolvedName = teacherName ? teacherName.trim() : '';
  let resolvedId = teacherId && Number.isFinite(Number(teacherId)) ? Number(teacherId) : null;
  let resolvedEmail = teacherEmail ? teacherEmail.trim() : null;

  if (resolvedId !== null && resolvedId <= 0) {
    resolvedId = null;
  }

  if (resolvedId) {
    const user = await User.findById(resolvedId);
    if (!user) {
      const err = new Error('Selected teacher does not exist');
      err.status = 400;
      throw err;
    }
    if (normalizeRole(user.role) !== 'teacher') {
      const err = new Error('Selected user is not assigned the teacher role');
      err.status = 400;
      throw err;
    }
    resolvedName = resolvedName || user.name || user.email || resolvedName;
    resolvedEmail = resolvedEmail || user.email || null;
    return { teacherId: user.id, teacherName: resolvedName, teacherEmail: resolvedEmail };
  }

  return {
    teacherId: null,
    teacherName: resolvedName || null,
    teacherEmail: resolvedEmail
  };
};

export class Class {
  static async createTable() {
    // First, drop the unique constraint if it exists
    try {
      await pool.query('ALTER TABLE classes DROP CONSTRAINT IF EXISTS classes_code_key');
      console.log('✓ Dropped unique constraint on classes.code');
    } catch (error) {
      // Constraint might not exist, which is fine
    }

    const query = `
      CREATE TABLE IF NOT EXISTS classes (
        id SERIAL PRIMARY KEY,
        code VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        subject_id INTEGER REFERENCES subjects(id) ON DELETE SET NULL,
        department_id INTEGER REFERENCES departments(id) ON DELETE SET NULL,
        teacher VARCHAR(255),
        teacher_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        teacher_email VARCHAR(255),
        room VARCHAR(100),
        day VARCHAR(50),
        time_slot VARCHAR(50),
        duration INTEGER DEFAULT 60,
        max_students INTEGER DEFAULT 30,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    await pool.query(query);

    const maintenanceQueries = [
      `ALTER TABLE classes ADD COLUMN IF NOT EXISTS teacher_id INTEGER REFERENCES users(id) ON DELETE SET NULL`,
      `ALTER TABLE classes ADD COLUMN IF NOT EXISTS teacher_email VARCHAR(255)` ,
      `CREATE INDEX IF NOT EXISTS idx_classes_teacher_id ON classes(teacher_id)`
    ];

    for (const maintenanceQuery of maintenanceQueries) {
      try {
        await pool.query(maintenanceQuery);
      } catch (maintenanceError) {
        console.error('Failed to run classes maintenance query:', maintenanceError.message);
      }
    }
  }

  static async getAll() {
    const query = `
      SELECT 
        c.*,
        s.name as subject_name,
        s.code as subject_code,
        d.name as department_name,
        d.code as department_code,
        u.name AS teacher_full_name,
        u.email AS teacher_email
      FROM classes c
      LEFT JOIN subjects s ON c.subject_id = s.id
      LEFT JOIN departments d ON c.department_id = d.id
      LEFT JOIN users u ON u.id = c.teacher_id
      ORDER BY c.name
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  static async create(classData) {
    const {
      code,
      name,
      subject_id,
      department_id,
      teacher,
      teacher_id,
      teacher_email,
      room,
      day,
      time_slot,
      max_students,
      duration
    } = classData;

    const { teacherId, teacherName, teacherEmail: resolvedTeacherEmail } = await resolveTeacherDetails({
      teacherId: teacher_id,
      teacherName: teacher,
      teacherEmail: teacher_email
    });

    const effectiveTeacherName = teacherName || null;
    const effectiveTeacherEmail = resolvedTeacherEmail || teacher_email || null;

    const teacherConflictValue = teacherId ?? effectiveTeacherName;

    // Prevent teacher conflict on same day and time_slot
    if (teacherConflictValue && day && time_slot) {
      const conflict = await Class.hasConflict({
        teacher: effectiveTeacherName,
        teacher_id: teacherId,
        day,
        time_slot,
        excludeTable: 'classes'
      });
      if (conflict) {
        const err = new Error('SCHEDULE_CONFLICT: Teacher already has a class or lab at this time');
        err.status = 400;
        throw err;
      }
    }

    const query = `
      INSERT INTO classes (code, name, subject_id, department_id, teacher, teacher_id, teacher_email, room, day, time_slot, duration, max_students)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `;

    try {
      const result = await pool.query(query, [
        code,
        name,
        subject_id,
        department_id,
        effectiveTeacherName,
        teacherId,
        effectiveTeacherEmail,
        room,
        day,
        time_slot,
        duration ?? 60,
        max_students ?? 30
      ]);
      return result.rows[0];
    } catch (error) {
      // Handle database errors and format them properly
      console.error('Database error in Class.create():', error);

      // Check for specific database errors
      if (error.code === '23505') { // unique_violation
        // Removed unique constraint error handling for class codes - allowing duplicate codes
      }

      if (error.code === '23503') { // foreign_key_violation
        if (error.constraint?.includes('classes_subject_id_fkey')) {
          const err = new Error('Invalid subject selected. Please ensure the subject exists.');
          err.status = 400;
          throw err;
        }
        if (error.constraint?.includes('classes_department_id_fkey')) {
          const err = new Error('Invalid department selected. Please ensure the department exists.');
          err.status = 400;
          throw err;
        }
      }

      // For any other database error, throw a generic error
      const err = new Error('Failed to create class due to database error');
      err.status = 500;
      err.originalError = error;
      throw err;
    }
  }

  static async update(id, classData) {
    const {
      code,
      name,
      subject_id,
      department_id,
      teacher,
      teacher_id,
      teacher_email,
      room,
      day,
      time_slot,
      max_students,
      duration
    } = classData;

    const { teacherId, teacherName, teacherEmail: resolvedTeacherEmail } = await resolveTeacherDetails({
      teacherId: teacher_id,
      teacherName: teacher,
      teacherEmail: teacher_email
    });

    const effectiveTeacherName = teacherName || null;
    const effectiveTeacherEmail = resolvedTeacherEmail || teacher_email || null;

    const teacherConflictValue = teacherId ?? effectiveTeacherName;

    // Prevent teacher conflict on same day and time_slot (exclude current id)
    if (teacherConflictValue && day && time_slot) {
      const conflict = await Class.hasConflict({
        teacher: effectiveTeacherName,
        teacher_id: teacherId,
        day,
        time_slot,
        excludeId: id,
        excludeTable: 'classes'
      });
      if (conflict) {
        const err = new Error('SCHEDULE_CONFLICT: Teacher already has a class or lab at this time');
        err.status = 400;
        throw err;
      }
    }

    const query = `
      UPDATE classes
      SET code = $1,
          name = $2,
          subject_id = $3,
          department_id = $4,
          teacher = $5,
          teacher_id = $6,
          teacher_email = $7,
          room = $8,
          day = $9,
          time_slot = $10,
          duration = COALESCE($11, duration),
          max_students = COALESCE($12, max_students)
      WHERE id = $13
      RETURNING *
    `;

    try {
      const result = await pool.query(query, [
        code,
        name,
        subject_id,
        department_id,
        effectiveTeacherName,
        teacherId,
        effectiveTeacherEmail,
        room,
        day,
        time_slot,
        duration ?? null,
        max_students ?? null,
        id
      ]);
      return result.rows[0];
    } catch (error) {
      // Handle database errors and format them properly
      console.error('Database error in Class.update():', error);

      // Check for specific database errors
      if (error.code === '23505') { // unique_violation
        // Removed unique constraint error handling for class codes - allowing duplicate codes
      }

      if (error.code === '23503') { // foreign_key_violation
        if (error.constraint?.includes('classes_subject_id_fkey')) {
          const err = new Error('Invalid subject selected. Please ensure the subject exists.');
          err.status = 400;
          throw err;
        }
        if (error.constraint?.includes('classes_department_id_fkey')) {
          const err = new Error('Invalid department selected. Please ensure the department exists.');
          err.status = 400;
          throw err;
        }
      }

      // For any other database error, throw a generic error
      const err = new Error('Failed to update class due to database error');
      err.status = 500;
      err.originalError = error;
      throw err;
    }
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

    const teacherId = teacher_id && Number.isFinite(Number(teacher_id)) ? Number(teacher_id) : null;
    const teacherName = teacher ? teacher.trim() : null;

    if (!teacherId && !teacherName) {
      return false;
    }

    const checkConflict = async ({ table, teacherCondition }) => {
      let query = `SELECT 1 FROM ${table} WHERE day = $1 AND time_slot = $2`;
      const params = [day, time_slot];

      if (teacherCondition.field && teacherCondition.value !== undefined && teacherCondition.value !== null) {
        if (teacherCondition.caseInsensitive) {
          query += ` AND LOWER(${teacherCondition.field}) = LOWER($${params.length + 1})`;
        } else {
          query += ` AND ${teacherCondition.field} = $${params.length + 1}`;
        }
        params.push(teacherCondition.value);
      } else {
        return false;
      }

      if (excludeId && excludeTable === table) {
        query += ` AND id != $${params.length + 1}`;
        params.push(excludeId);
      }

      query += ' LIMIT 1';

      try {
        const result = await pool.query(query, params);
        return result.rows.length > 0;
      } catch (error) {
        console.error(`Error checking ${table} conflicts:`, error);
        return false;
      }
    };

    const classConflict = await checkConflict({
      table: 'classes',
      teacherCondition: teacherId
        ? { field: 'teacher_id', value: teacherId }
        : { field: 'teacher', value: teacherName, caseInsensitive: true }
    });

    if (classConflict) {
      return true;
    }

    const labConflict = await checkConflict({
      table: 'labs',
      teacherCondition: teacherId
        ? { field: 'teacher', value: teacherId }
        : { field: null, value: null }
    });

    if (labConflict) {
      return true;
    }

    return false;
  }

  static async delete(id) {
    const query = 'DELETE FROM classes WHERE id = $1';
    await pool.query(query, [id]);
  }

  static async getById(id) {
    const query = `
      SELECT 
        c.*,
        s.name as subject_name,
        s.code as subject_code,
        d.name as department_name,
        d.code as department_code,
        u.name AS teacher_full_name,
        u.email AS teacher_email
      FROM classes c
      LEFT JOIN subjects s ON c.subject_id = s.id
      LEFT JOIN departments d ON c.department_id = d.id
      LEFT JOIN users u ON u.id = c.teacher_id
      WHERE c.id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async getBySubject(subjectId) {
    const query = `
      SELECT 
        c.*,
        s.name as subject_name,
        s.code as subject_code,
        d.name as department_name,
        d.code as department_code
      FROM classes c
      LEFT JOIN subjects s ON c.subject_id = s.id
      LEFT JOIN departments d ON c.department_id = d.id
      WHERE c.subject_id = $1
      ORDER BY c.day, c.time_slot
    `;
    const result = await pool.query(query, [subjectId]);
    return result.rows;
  }

  static async getByDepartment(departmentId) {
    const query = `
      SELECT 
        c.*,
        s.name as subject_name,
        s.code as subject_code,
        d.name as department_name,
        d.code as department_code
      FROM classes c
      LEFT JOIN subjects s ON c.subject_id = s.id
      LEFT JOIN departments d ON c.department_id = d.id
      WHERE c.department_id = $1
      ORDER BY c.day, c.time_slot
    `;
    const result = await pool.query(query, [departmentId]);
    return result.rows;
  }

  static async delete(id) {
    const query = 'DELETE FROM classes WHERE id = $1';
    await pool.query(query, [id]);
  }
}

export default Class;
