import pool from '../config/database.js';

export class User {
  constructor(email, password, name = null, role = 'teacher', department = null) {
    this.email = email;
    this.password = password;
    this.name = name;
    this.role = role;
    this.department = department;
    this.created_at = new Date();
  }

  static async createTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255),
        role VARCHAR(50) DEFAULT 'teacher',
        department VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    await pool.query(query);
    console.log('Users table created or already exists');
  }

  static async findByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await pool.query(query, [email]);
    return result.rows[0] || null;
  }

  static async findById(id) {
    const query = 'SELECT * FROM users WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  static async create(userData) {
    const { email, password, name, role, department } = userData;
    const query = `
      INSERT INTO users (email, password, name, role, department)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, email, name, role, department, created_at
    `;
    const result = await pool.query(query, [email, password, name, role, department]);
    return result.rows[0];
  }
  static async update(id, updates) {
    const fields = Object.keys(updates).map((key, index) => `${key} = $${index + 1}`);
    const values = Object.values(updates);
    const query = `UPDATE users SET ${fields.join(', ')} WHERE id = $${fields.length + 1} RETURNING *`;
    const result = await pool.query(query, [...values, id]);
    return result.rows[0];
  }

  static async delete(id) {
    const query = 'DELETE FROM users WHERE id = $1';
    await pool.query(query, [id]);
  }
}

