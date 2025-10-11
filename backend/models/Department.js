import pool from '../config/database.js';

export class Department {
  static async createTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS departments (
        id SERIAL PRIMARY KEY,
        code VARCHAR(50) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        head_of_department VARCHAR(255),
        contact_email VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    await pool.query(query);
  }

  static async getAll() {
    const result = await pool.query('SELECT * FROM departments ORDER BY name');
    return result.rows;
  }

  static async getById(id) {
    const query = 'SELECT * FROM departments WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async getByCode(code) {
    const query = 'SELECT * FROM departments WHERE code = $1';
    const result = await pool.query(query, [code]);
    return result.rows[0];
  }

  static async create(departmentData) {
    const { code, name, description, head_of_department, contact_email } = departmentData;
    const query = `
      INSERT INTO departments (code, name, description, head_of_department, contact_email)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const result = await pool.query(query, [code, name, description, head_of_department, contact_email]);
    return result.rows[0];
  }

  static async update(id, departmentData) {
    const { code, name, description, head_of_department, contact_email } = departmentData;
    const query = `
      UPDATE departments
      SET code = $1, name = $2, description = $3, head_of_department = $4, contact_email = $5
      WHERE id = $6
      RETURNING *
    `;
    const result = await pool.query(query, [code, name, description, head_of_department, contact_email, id]);
    return result.rows[0];
  }

  static async delete(id) {
    const query = 'DELETE FROM departments WHERE id = $1';
    await pool.query(query, [id]);
  }

  static async search(searchTerm) {
    const query = `
      SELECT * FROM departments 
      WHERE name ILIKE $1 OR code ILIKE $1 OR description ILIKE $1
      ORDER BY name
    `;
    const result = await pool.query(query, [`%${searchTerm}%`]);
    return result.rows;
  }

  static async getWithStats() {
    const query = `
      SELECT 
        d.*,
        COUNT(DISTINCT s.id) as subject_count,
        COUNT(DISTINCT f.id) as faculty_count,
        COUNT(DISTINCT c.id) as class_count
      FROM departments d
      LEFT JOIN subjects s ON d.id = s.department_id
      LEFT JOIN faculty f ON f.subject = s.name
      LEFT JOIN classes c ON c.subject_id = s.id
      GROUP BY d.id
      ORDER BY d.name
    `;
    const result = await pool.query(query);
    return result.rows;
  }
}

export default Department;
