// routes/labs.js
import express from 'express';
import { Lab } from '../models/Lab.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import pool from '../config/database.js';

const router = express.Router();

// Normalize PG TEXT[] or any odd driver return into JS array
function ensureArray(val) {
  if (Array.isArray(val)) return val;
  if (val == null) return [];
  try {
    const parsed = typeof val === 'string' ? JSON.parse(val) : val;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

// GET /api/labs  (auth required)
// Tries JOIN query first; if it fails (missing table/column), falls back to plain labs.
router.get('/', authenticateToken, async (req, res) => {
  const joinSql = `
    SELECT l.*,
           s.name AS subject_name,
           d.name AS department_name,
           u.name AS teacher_name
    FROM labs l
    LEFT JOIN subjects   s ON l.subject_id    = s.id
    LEFT JOIN departments d ON l.department_id = d.id
    LEFT JOIN users      u ON (
      l.teacher IS NOT NULL
      AND l.teacher != ''
      AND l.teacher ~ '^[0-9]+$'
      AND l.teacher::integer = u.id::text
    )
    ORDER BY l.name
  `;

  try {
    const { rows } = await pool.query(joinSql);
    const safe = rows.map(r => ({
      id: r.id,
      name: r.name ?? '',
      capacity: r.capacity ?? 0,
      resources: ensureArray(r.resources),
      subject_id: r.subject_id ?? null,
      department_id: r.department_id ?? null,
      teacher: r.teacher ?? null,
      teacher_name: r.teacher_name ?? '',
      room: r.room ?? '',
      day: r.day ?? '',
      time_slot: r.time_slot ?? '',
      duration: r.duration ?? 60,
      max_students: r.max_students ?? 30,
      subject_name: r.subject_name ?? '',
      department_name: r.department_name ?? '',
    }));
    return res.json(safe);
  } catch (error) {
    console.error('JOIN fetch failed, falling back to plain labs:', {
      code: error.code,
      message: error.message,
      detail: error.detail,
      hint: error.hint,
      position: error.position,
      internalPosition: error.internalPosition,
      internalQuery: error.internalQuery,
      context: error.context,
      schema: error.schema,
      table: error.table,
      column: error.column,
      dataType: error.dataType,
      constraint: error.constraint,
      file: error.file,
      line: error.line,
      routine: error.routine,
      stack: error.stack
    });

    try {
      const rows = await Lab.getAll();
      const safe = rows.map(r => ({
        id: r.id,
        name: r.name ?? '',
        capacity: r.capacity ?? 0,
        resources: ensureArray(r.resources),
        subject_id: r.subject_id ?? null,
        department_id: r.department_id ?? null,
        teacher: r.teacher ?? null,
        teacher_name: '',
        room: r.room ?? '',
        day: r.day ?? '',
        time_slot: r.time_slot ?? '',
        duration: r.duration ?? 60,
        max_students: r.max_students ?? 30,
        subject_name: '',
        department_name: '',
      }));
      return res.json(safe);
    } catch (err2) {
      console.error('Fallback fetch failed:', {
        code: err2.code,
        message: err2.message,
        detail: err2.detail,
      });
      return res.status(500).json({ error: 'Failed to fetch labs' });
    }
  }
});

// POST /api/labs (admin)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const newLab = await Lab.create(req.body);
    res.status(201).json(newLab);
  } catch (error) {
    console.error('Error creating lab:', {
      code: error.code,
      message: error.message,
      detail: error.detail,
    });
    res.status(500).json({ error: 'Failed to create lab' });
  }
});

// PUT /api/labs/:id (admin)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const updatedLab = await Lab.update(req.params.id, req.body);
    if (!updatedLab) return res.status(404).json({ error: 'Lab not found' });
    res.json(updatedLab);
  } catch (error) {
    console.error('Error updating lab:', {
      code: error.code,
      message: error.message,
      detail: error.detail,
    });
    res.status(500).json({ error: 'Failed to update lab' });
  }
});

// DELETE /api/labs/:id (admin)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    await Lab.delete(req.params.id);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting lab:', {
      code: error.code,
      message: error.message,
      detail: error.detail,
    });
    res.status(500).json({ error: 'Failed to delete lab' });
  }
});

// POST /api/labs/:id/schedule (admin)
router.post('/:id/schedule', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { day, time_slot, duration, subject_id, teacher, room, max_students } = req.body;

    const query = `
      UPDATE labs
      SET day = $1, time_slot = $2, duration = $3, subject_id = $4,
          teacher = $5, room = $6, max_students = $7
      WHERE id = $8
      RETURNING *
    `;
    const values = [
      String(day ?? ''),
      String(time_slot ?? ''),
      Number.isFinite(Number(duration)) ? Number(duration) : 60,
      (subject_id === '' || subject_id === null || subject_id === undefined) ? null : Number(subject_id),
      (teacher === '' || teacher === null || teacher === undefined) ? null : Number(teacher),
      String(room ?? ''),
      Number.isFinite(Number(max_students)) ? Number(max_students) : 30,
      Number(id),
    ];

    const result = await pool.query(query, values);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Lab not found' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error scheduling lab session:', {
      code: error.code,
      message: error.message,
      detail: error.detail,
    });
    res.status(500).json({ error: 'Failed to schedule lab session' });
  }
});

export default router;
