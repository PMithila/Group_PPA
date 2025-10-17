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
        head_of_department_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        contact_email VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    await pool.query(query);

    // Ensure new columns/indexes exist for legacy tables
    const addColumnQueries = [
      `ALTER TABLE departments ADD COLUMN IF NOT EXISTS head_of_department_id INTEGER REFERENCES users(id) ON DELETE SET NULL`,
      `CREATE UNIQUE INDEX IF NOT EXISTS idx_departments_head_teacher_unique
        ON departments(head_of_department_id)
        WHERE head_of_department_id IS NOT NULL`
    ];

    for (const q of addColumnQueries) {
      await pool.query(q);
    }
  }

  static async getAll() {
    const result = await pool.query(`
      SELECT 
        d.*,
        u.name AS head_teacher_name,
        u.email AS head_teacher_email
      FROM departments d
      LEFT JOIN users u ON u.id = d.head_of_department_id
      ORDER BY d.name
    `);
    return result.rows;
  }

  static async getById(id) {
    const query = `
      SELECT 
        d.*,
        u.name AS head_teacher_name,
        u.email AS head_teacher_email
      FROM departments d
      LEFT JOIN users u ON u.id = d.head_of_department_id
      WHERE d.id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async getByCode(code) {
    const query = `
      SELECT 
        d.*,
        u.name AS head_teacher_name,
        u.email AS head_teacher_email
      FROM departments d
      LEFT JOIN users u ON u.id = d.head_of_department_id
      WHERE d.code = $1
    `;
    const result = await pool.query(query, [code]);
    return result.rows[0];
  }

  static async create(departmentData) {
    const {
      code,
      name,
      description,
      head_of_department,
      head_of_department_id,
      contact_email
    } = departmentData;

    const query = `
      INSERT INTO departments (code, name, description, head_of_department, head_of_department_id, contact_email)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const result = await pool.query(query, [
      code,
      name,
      description,
      head_of_department,
      head_of_department_id ?? null,
      contact_email
    ]);
    return result.rows[0];
  }

  static async update(id, departmentData) {
    const {
      code,
      name,
      description,
      head_of_department,
      head_of_department_id,
      contact_email
    } = departmentData;
    const query = `
      UPDATE departments
      SET code = $1,
          name = $2,
          description = $3,
          head_of_department = $4,
          head_of_department_id = $5,
          contact_email = $6
      WHERE id = $7
      RETURNING *
    `;
    const result = await pool.query(query, [
      code,
      name,
      description,
      head_of_department,
      head_of_department_id ?? null,
      contact_email,
      id
    ]);
    return result.rows[0];
  }

  static async isHeadAssigned(userId, excludeDepartmentId = null) {
    if (!userId) return false;
    const params = [userId];
    let query = `
      SELECT 1 FROM departments
      WHERE head_of_department_id = $1
    `;

    if (excludeDepartmentId) {
      params.push(Number(excludeDepartmentId));
      query += ` AND id != $2`;
    }

    const result = await pool.query(query, params);
    return result.rows.length > 0;
  }

  static async delete(id) {
    const query = 'DELETE FROM departments WHERE id = $1';
    await pool.query(query, [id]);
  }

  static async findByNameOrCodeLike(term) {
    if (!term) return null;
    const trimmed = term.trim();
    if (!trimmed) return null;

    const query = `
      SELECT *
      FROM departments
      WHERE LOWER(code) = LOWER($1)
         OR LOWER(name) = LOWER($1)
         OR LOWER(code) LIKE LOWER($2)
         OR LOWER(name) LIKE LOWER($2)
      ORDER BY LENGTH(name) ASC
      LIMIT 1
    `;
    const params = [trimmed, `%${trimmed}%`];
    const result = await pool.query(query, params);
    return result.rows[0] || null;
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
