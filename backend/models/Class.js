import pool from '../config/database.js';

export class Class {
  static async createTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS classes (
        id SERIAL PRIMARY KEY,
        code VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        teacher VARCHAR(255),
        room VARCHAR(100),
        day VARCHAR(50),
        time_slot VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    await pool.query(query);
  }

  static async getAll() {
    const result = await pool.query('SELECT * FROM classes ORDER BY name');
    return result.rows;
  }

  static async create(classData) {
    const { code, name, teacher, room, day, time_slot } = classData;
    const query = `
      INSERT INTO classes (code, name, teacher, room, day, time_slot)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const result = await pool.query(query, [code, name, teacher, room, day, time_slot]);
    return result.rows[0];
  }

  static async update(id, classData) {
    const { code, name, teacher, room, day, time_slot } = classData;
    const query = `
      UPDATE classes
      SET code = $1, name = $2, teacher = $3, room = $4, day = $5, time_slot = $6
      WHERE id = $7
      RETURNING *
    `;
    const result = await pool.query(query, [code, name, teacher, room, day, time_slot, id]);
    return result.rows[0];
  }

  static async delete(id) {
    const query = 'DELETE FROM classes WHERE id = $1';
    await pool.query(query, [id]);
  }
}

export default Class;
