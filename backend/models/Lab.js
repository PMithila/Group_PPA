import pool from '../config/database.js';

export class Lab {
  static async createTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS labs (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        capacity INTEGER,
        resources TEXT[],
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
    const { name, capacity, resources } = labData;
    const query = `
      INSERT INTO labs (name, capacity, resources) 
      VALUES ($1, $2, $3) 
      RETURNING *
    `;
    const result = await pool.query(query, [name, capacity, resources]);
    return result.rows[0];
  }

  static async update(id, labData) {
    const { name, capacity, resources } = labData;
    const query = `
      UPDATE labs 
      SET name = $1, capacity = $2, resources = $3
      WHERE id = $4
      RETURNING *
    `;
    const result = await pool.query(query, [name, capacity, resources, id]);
    return result.rows[0];
  }

  static async delete(id) {
    const query = 'DELETE FROM labs WHERE id = $1';
    await pool.query(query, [id]);
  }
}

export default Lab;
