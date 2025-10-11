import pool from '../config/database.js';

export class Class {
  static async createTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS classes (
        id SERIAL PRIMARY KEY,
        code VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        subject_id INTEGER REFERENCES subjects(id) ON DELETE SET NULL,
        department_id INTEGER REFERENCES departments(id) ON DELETE SET NULL,
        teacher VARCHAR(255),
        room VARCHAR(100),
        day VARCHAR(50),
        time_slot VARCHAR(50),
        duration INTEGER DEFAULT 60,
        max_students INTEGER DEFAULT 30,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    await pool.query(query);
  }

  static async getAll() {
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
      ORDER BY c.name
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  static async create(classData) {
    const { code, name, subject_id, department_id, teacher, room, day, time_slot, duration, max_students } = classData;

    // Prevent teacher conflict on same day and time_slot
    if (teacher && day && time_slot) {
      const conflict = await Class.hasConflict({ teacher, day, time_slot });
      if (conflict) {
        const err = new Error('SCHEDULE_CONFLICT: Teacher already has a class at this time');
        err.status = 400;
        throw err;
      }
    }

    const query = `
      INSERT INTO classes (code, name, subject_id, department_id, teacher, room, day, time_slot, duration, max_students)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;

    try {
      const result = await pool.query(query, [code, name, subject_id, department_id, teacher, room, day, time_slot, duration, max_students]);
      return result.rows[0];
    } catch (error) {
      // Handle database errors and format them properly
      console.error('Database error in Class.create():', error);

      // Check for specific database errors
      if (error.code === '23505') { // unique_violation
        if (error.constraint?.includes('classes_code_key')) {
          const err = new Error('A class with this code already exists');
          err.status = 400;
          throw err;
        }
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
    const { code, name, subject_id, department_id, teacher, room, day, time_slot, duration, max_students } = classData;

    // Prevent teacher conflict on same day and time_slot (exclude current id)
    if (teacher && day && time_slot) {
      const conflict = await Class.hasConflict({ teacher, day, time_slot, excludeId: id });
      if (conflict) {
        const err = new Error('SCHEDULE_CONFLICT: Teacher already has a class at this time');
        err.status = 400;
        throw err;
      }
    }

    const query = `
      UPDATE classes
      SET code = $1, name = $2, subject_id = $3, department_id = $4, teacher = $5, room = $6, day = $7, time_slot = $8, duration = $9, max_students = $10
      WHERE id = $11
      RETURNING *
    `;

    try {
      const result = await pool.query(query, [code, name, subject_id, department_id, teacher, room, day, time_slot, duration, max_students, id]);
      return result.rows[0];
    } catch (error) {
      // Handle database errors and format them properly
      console.error('Database error in Class.update():', error);

      // Check for specific database errors
      if (error.code === '23505') { // unique_violation
        if (error.constraint?.includes('classes_code_key')) {
          const err = new Error('A class with this code already exists');
          err.status = 400;
          throw err;
        }
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

  static async hasConflict({ teacher, day, time_slot, excludeId = null }) {
    const params = [teacher, day, time_slot];
    let query = `SELECT 1 FROM classes WHERE teacher = $1 AND day = $2 AND time_slot = $3`;
    if (excludeId) {
      params.push(excludeId);
      query += ` AND id <> $4`;
    }
    query += ` LIMIT 1`;

    try {
      const result = await pool.query(query, params);
      return result.rowCount > 0;
    } catch (error) {
      console.error('Database error in Class.hasConflict():', error);
      // For conflict checking, if there's a database error, assume no conflict to be safe
      return false;
    }
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
        d.code as department_code
      FROM classes c
      LEFT JOIN subjects s ON c.subject_id = s.id
      LEFT JOIN departments d ON c.department_id = d.id
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
}

export default Class;
