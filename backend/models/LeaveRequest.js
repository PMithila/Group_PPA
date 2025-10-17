import pool from '../config/database.js';

export const LEAVE_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected'
};

export class LeaveRequest {
  static async createTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS leave_requests (
        id SERIAL PRIMARY KEY,
        teacher_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        reason TEXT NOT NULL,
        status VARCHAR(20) DEFAULT '${LEAVE_STATUS.PENDING}',
        decision_note TEXT,
        decision_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
        decision_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    const indexQuery = `
      CREATE INDEX IF NOT EXISTS idx_leave_requests_teacher
      ON leave_requests(teacher_id, created_at DESC);
    `;

    await pool.query(query);
    await pool.query(indexQuery);
    console.log('Leave requests table ready');
  }

  static async create({ teacherId, startDate, endDate, reason }) {
    const query = `
      INSERT INTO leave_requests (teacher_id, start_date, end_date, reason)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const params = [teacherId, startDate, endDate, reason];
    const result = await pool.query(query, params);
    return result.rows[0];
  }

  static async getForTeacher(teacherId) {
    const query = `
      SELECT
        lr.*,
        teacher.name AS teacher_name,
        teacher.email AS teacher_email,
        approver.name AS approver_name,
        approver.email AS approver_email
      FROM leave_requests lr
      JOIN users teacher ON teacher.id = lr.teacher_id
      LEFT JOIN users approver ON approver.id = lr.decision_by
      WHERE lr.teacher_id = $1
      ORDER BY lr.created_at DESC
    `;
    const result = await pool.query(query, [teacherId]);
    return result.rows;
  }

  static async getAll() {
    const query = `
      SELECT
        lr.*,
        teacher.name AS teacher_name,
        teacher.email AS teacher_email,
        approver.name AS approver_name,
        approver.email AS approver_email
      FROM leave_requests lr
      JOIN users teacher ON teacher.id = lr.teacher_id
      LEFT JOIN users approver ON approver.id = lr.decision_by
      ORDER BY lr.created_at DESC
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  static async findById(id) {
    const query = `
      SELECT
        lr.*,
        teacher.name AS teacher_name,
        teacher.email AS teacher_email,
        approver.name AS approver_name,
        approver.email AS approver_email
      FROM leave_requests lr
      JOIN users teacher ON teacher.id = lr.teacher_id
      LEFT JOIN users approver ON approver.id = lr.decision_by
      WHERE lr.id = $1
      LIMIT 1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  static async updateStatus(id, { status, decisionNote, decisionBy }) {
    const query = `
      UPDATE leave_requests
      SET
        status = $1,
        decision_note = $2,
        decision_by = $3,
        decision_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $4
      RETURNING *
    `;
    const params = [status, decisionNote || null, decisionBy, id];
    const result = await pool.query(query, params);
    return result.rows[0] || null;
  }
}

