import pool from '../config/database.js';

export const CHANGE_REQUEST_STATUS = {
  PENDING: 'pending',
  RESOLVED: 'resolved',
  REJECTED: 'rejected'
};

const STATUS_VALUES = Object.values(CHANGE_REQUEST_STATUS);

const parseJson = (value) => {
  if (!value) return null;
  if (typeof value === 'object') return value;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

const baseSelect = `
  SELECT
    scr.*,
    row_to_json(teacher_user) AS teacher_details,
    row_to_json(cls) AS class_details,
    row_to_json(lab) AS lab_details,
    row_to_json(admin_user) AS admin_details
  FROM schedule_change_requests AS scr
  JOIN users AS teacher_user ON teacher_user.id = scr.teacher_id
  LEFT JOIN classes AS cls ON cls.id = scr.class_id
  LEFT JOIN labs AS lab ON lab.id = scr.lab_id
  LEFT JOIN users AS admin_user ON admin_user.id = scr.admin_id
`;

const mapRow = (row) => ({
  id: row.id,
  teacher_id: row.teacher_id,
  teacher_name: row.teacher_name,
  teacher_details: parseJson(row.teacher_details),
  class_id: row.class_id,
  lab_id: row.lab_id,
  reason: row.reason,
  desired_day: row.desired_day,
  desired_time_slot: row.desired_time_slot,
  desired_room: row.desired_room,
  desired_notes: row.desired_notes,
  status: row.status,
  admin_notes: row.admin_notes,
  admin_id: row.admin_id,
  resolved_at: row.resolved_at,
  created_at: row.created_at,
  updated_at: row.updated_at,
  class_details: parseJson(row.class_details),
  lab_details: parseJson(row.lab_details),
  admin_details: parseJson(row.admin_details)
});

const TABLE_NOT_FOUND = '42P01';
let tableEnsured = false;

const runWithTableRetry = async (operation) => {
  try {
    return await operation();
  } catch (error) {
    if (error?.code === TABLE_NOT_FOUND) {
      await ScheduleChangeRequest.createTable();
      return operation();
    }
    throw error;
  }
};

export class ScheduleChangeRequest {
  static async createTable() {
    const tableQuery = `
      CREATE TABLE IF NOT EXISTS schedule_change_requests (
        id SERIAL PRIMARY KEY,
        teacher_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        teacher_name VARCHAR(255),
        class_id INTEGER REFERENCES classes(id) ON DELETE CASCADE,
        lab_id INTEGER REFERENCES labs(id) ON DELETE CASCADE,
        reason TEXT NOT NULL,
        desired_day VARCHAR(50),
        desired_time_slot VARCHAR(50),
        desired_room VARCHAR(100),
        desired_notes TEXT,
        status VARCHAR(20) NOT NULL DEFAULT '${CHANGE_REQUEST_STATUS.PENDING}',
        admin_notes TEXT,
        admin_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        resolved_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT schedule_change_requests_class_or_lab_chk
          CHECK (
            (class_id IS NOT NULL AND lab_id IS NULL)
            OR (class_id IS NULL AND lab_id IS NOT NULL)
          ),
        CONSTRAINT schedule_change_requests_status_chk
          CHECK (status IN ('${STATUS_VALUES.join("','")}'))
      )
    `;

    const statusIndex = `
      CREATE INDEX IF NOT EXISTS idx_schedule_change_requests_status
      ON schedule_change_requests (status, created_at DESC);
    `;

    const teacherIndex = `
      CREATE INDEX IF NOT EXISTS idx_schedule_change_requests_teacher
      ON schedule_change_requests (teacher_id, created_at DESC);
    `;

    await pool.query(tableQuery);
    await pool.query(statusIndex);
    await pool.query(teacherIndex);
    tableEnsured = true;
  }

  static async create({
    teacherId,
    teacherName,
    classId = null,
    labId = null,
    reason,
    desiredDay = null,
    desiredTimeSlot = null,
    desiredRoom = null,
    desiredNotes = null
  }) {
    const insertQuery = `
      INSERT INTO schedule_change_requests (
        teacher_id,
        teacher_name,
        class_id,
        lab_id,
        reason,
        desired_day,
        desired_time_slot,
        desired_room,
        desired_notes
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id
    `;

    const params = [
      teacherId,
      teacherName || null,
      classId,
      labId,
      reason,
      desiredDay,
      desiredTimeSlot,
      desiredRoom,
      desiredNotes
    ];

    const result = await runWithTableRetry(() => pool.query(insertQuery, params));
    return ScheduleChangeRequest.findById(result.rows[0].id);
  }

  static async findById(id) {
    if (!tableEnsured) {
      try {
        await ScheduleChangeRequest.createTable();
      } catch (createError) {
        if (createError?.code !== TABLE_NOT_FOUND) {
          throw createError;
        }
      }
    }

    const query = `${baseSelect} WHERE scr.id = $1 LIMIT 1`;
    const { rows } = await runWithTableRetry(() => pool.query(query, [id]));
    if (!rows.length) return null;
    return mapRow(rows[0]);
  }

  static async getAll() {
    if (!tableEnsured) {
      await ScheduleChangeRequest.createTable();
    }

    const query = `${baseSelect} ORDER BY scr.created_at DESC`;
    const { rows } = await runWithTableRetry(() => pool.query(query));
    return rows.map(mapRow);
  }

  static async getForTeacher(teacherId) {
    if (!tableEnsured) {
      await ScheduleChangeRequest.createTable();
    }

    const query = `${baseSelect} WHERE scr.teacher_id = $1 ORDER BY scr.created_at DESC`;
    const { rows } = await runWithTableRetry(() => pool.query(query, [teacherId]));
    return rows.map(mapRow);
  }

  static async findPendingForSession({ teacherId, classId = null, labId = null }) {
    const query = `
      ${baseSelect}
      WHERE scr.teacher_id = $1
        AND scr.status = '${CHANGE_REQUEST_STATUS.PENDING}'
        AND scr.class_id IS NOT DISTINCT FROM $2
        AND scr.lab_id IS NOT DISTINCT FROM $3
      ORDER BY scr.created_at DESC
      LIMIT 1
    `;

    const { rows } = await runWithTableRetry(() => pool.query(query, [teacherId, classId, labId]));
    if (!rows.length) return null;
    return mapRow(rows[0]);
  }

  static async updateStatus(id, { status, adminNotes = null, adminId = null }) {
    if (!STATUS_VALUES.includes(status)) {
      throw new Error(`Invalid status "${status}" provided for schedule change request`);
    }

    const resolvedAt =
      status === CHANGE_REQUEST_STATUS.RESOLVED || status === CHANGE_REQUEST_STATUS.REJECTED
        ? 'CURRENT_TIMESTAMP'
        : 'NULL';

    const updateQuery = `
      UPDATE schedule_change_requests
      SET
        status = $1,
        admin_notes = COALESCE($2, admin_notes),
        admin_id = COALESCE($3, admin_id),
        resolved_at = ${resolvedAt},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $4
      RETURNING id
    `;

    const result = await runWithTableRetry(() =>
      pool.query(updateQuery, [status, adminNotes, adminId, id])
    );
    if (!result.rows.length) {
      return null;
    }
    return ScheduleChangeRequest.findById(result.rows[0].id);
  }

  static async applyAndResolve(id, { adminId, adminNotes = null }) {
    const updateQuery = `
      UPDATE schedule_change_requests
      SET
        status = $1,
        admin_notes = COALESCE($2, admin_notes),
        admin_id = $3,
        resolved_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $4
      RETURNING id
    `;

    const result = await runWithTableRetry(() =>
      pool.query(updateQuery, [CHANGE_REQUEST_STATUS.RESOLVED, adminNotes, adminId, id])
    );

    if (!result.rows.length) {
      return null;
    }
    return ScheduleChangeRequest.findById(result.rows[0].id);
  }
}

export default ScheduleChangeRequest;
