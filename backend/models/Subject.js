import pool from '../config/database.js';

export class Subject {
  static async createTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS subjects (
        id SERIAL PRIMARY KEY,
        code VARCHAR(50) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        credits INTEGER DEFAULT 3,
        department_id INTEGER REFERENCES departments(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    await pool.query(query);
  }

  static async getAll() {
    const query = `
      SELECT s.*, d.name as department_name 
      FROM subjects s 
      LEFT JOIN departments d ON s.department_id = d.id 
      ORDER BY s.name
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  static async findByName(name) {
    if (!name) return null;
    const query = `
      SELECT s.*, d.name as department_name 
      FROM subjects s 
      LEFT JOIN departments d ON s.department_id = d.id 
      WHERE LOWER(s.name) = LOWER($1)
      ORDER BY s.id
      LIMIT 1
    `;
    const result = await pool.query(query, [name.trim()]);
    return result.rows[0] || null;
  }

  static async getById(id) {
    const query = `
      SELECT s.*, d.name as department_name 
      FROM subjects s 
      LEFT JOIN departments d ON s.department_id = d.id 
      WHERE s.id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async getByDepartment(departmentId) {
    const query = `
      SELECT s.*, d.name as department_name 
      FROM subjects s 
      LEFT JOIN departments d ON s.department_id = d.id 
      WHERE s.department_id = $1 
      ORDER BY s.name
    `;
    const result = await pool.query(query, [departmentId]);
    return result.rows;
  }

  static async create(subjectData) {
    const { code, name, description, department_id } = subjectData;
    const query = `
      INSERT INTO subjects (code, name, description, department_id)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const values = [code, name, description, department_id ?? null];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async update(id, subjectData) {
    const { code, name, description, department_id } = subjectData;
    const query = `
      UPDATE subjects
      SET code = $1, name = $2, description = $3, department_id = $4
      WHERE id = $5
      RETURNING *
    `;
    const values = [code, name, description, department_id ?? null, id];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async delete(id) {
    const query = 'DELETE FROM subjects WHERE id = $1';
    await pool.query(query, [id]);
  }

  static async search(searchTerm) {
    const query = `
      SELECT s.*, d.name as department_name 
      FROM subjects s 
      LEFT JOIN departments d ON s.department_id = d.id 
      WHERE s.name ILIKE $1 OR s.code ILIKE $1 OR s.description ILIKE $1
      ORDER BY s.name
    `;
    const result = await pool.query(query, [`%${searchTerm}%`]);
    return result.rows;
  }
}

export default Subject;
