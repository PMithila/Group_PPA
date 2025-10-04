import pool from '../config/database.js';

export class Faculty {
  static async createTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS faculty (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE,
        subject VARCHAR(255),
        availability JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    await pool.query(query);
  }

  static async getAll() {
    const result = await pool.query('SELECT * FROM faculty ORDER BY name');
    return result.rows;
  }

  static async create(facultyData) {
    const { name, email, subject, availability } = facultyData;
    const query = `
      INSERT INTO faculty (name, email, subject, availability) 
      VALUES ($1, $2, $3, $4) 
      RETURNING *
    `;
    const result = await pool.query(query, [name, email, subject, JSON.stringify(availability)]);
    return result.rows[0];
  }

  static async update(id, facultyData) {
    const { name, email, subject, availability } = facultyData;
    const query = `
      UPDATE faculty 
      SET name = $1, email = $2, subject = $3, availability = $4
      WHERE id = $5
      RETURNING *
    `;
    const result = await pool.query(query, [name, email, subject, JSON.stringify(availability), id]);
    return result.rows[0];
  }

  static async delete(id) {
    const query = 'DELETE FROM faculty WHERE id = $1';
    await pool.query(query, [id]);
  }
}

export default Faculty;
