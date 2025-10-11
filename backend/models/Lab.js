// models/Lab.js
import pool from '../config/database.js';

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
        duration INTEGER DEFAULT 60,
        max_students INTEGER DEFAULT 30,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    await pool.query(query);
  }

  static async getAll() {
    const result = await pool.query('SELECT * FROM labs ORDER BY name');
    return result.rows;
  }

  static async create(labData) {
    const {
      name = '',
      capacity = 0,
      resources = [],
      subject_id = null,
      department_id = null,
      teacher = null,
      room = '',
      day = '',
      time_slot = '',
      duration = 60,
      max_students = 30,
    } = labData;

    const query = `
      INSERT INTO labs (
        name, capacity, resources, subject_id, department_id,
        teacher, room, day, time_slot, duration, max_students
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
      RETURNING *
    `;
    const values = [
      String(name ?? ''),
      Number.isFinite(Number(capacity)) ? Number(capacity) : 0,
      toTextArray(resources),
      toIntOrNull(subject_id),
      toIntOrNull(department_id),
      toIntOrNull(teacher),
      String(room ?? ''),
      String(day ?? ''),
      String(time_slot ?? ''),
      Number.isFinite(Number(duration)) ? Number(duration) : 60,
      Number.isFinite(Number(max_students)) ? Number(max_students) : 30,
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async update(id, labData) {
    const {
      name = '',
      capacity = 0,
      resources = [],
      subject_id = null,
      department_id = null,
      teacher = null,
      room = '',
      day = '',
      time_slot = '',
      duration = 60,
      max_students = 30,
    } = labData;

    const query = `
      UPDATE labs
      SET name = $1, capacity = $2, resources = $3, subject_id = $4,
          department_id = $5, teacher = $6, room = $7, day = $8,
          time_slot = $9, duration = $10, max_students = $11
      WHERE id = $12
      RETURNING *
    `;
    const values = [
      String(name ?? ''),
      Number.isFinite(Number(capacity)) ? Number(capacity) : 0,
      toTextArray(resources),
      toIntOrNull(subject_id),
      toIntOrNull(department_id),
      toIntOrNull(teacher),
      String(room ?? ''),
      String(day ?? ''),
      String(time_slot ?? ''),
      Number.isFinite(Number(duration)) ? Number(duration) : 60,
      Number.isFinite(Number(max_students)) ? Number(max_students) : 30,
      Number(id),
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async delete(id) {
    await pool.query('DELETE FROM labs WHERE id = $1', [id]);
  }
}

export default Lab;
