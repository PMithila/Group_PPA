import Class from '../models/Class.js';
import { notifyTeacherAboutClass } from '../services/classNotificationService.js';

export const getClasses = async (req, res) => {
  try {
    const classes = await Class.getAll();
    res.json(classes);
  } catch (error) {
    console.error('Error fetching classes:', error);
    res.status(500).json({ error: 'Failed to fetch classes' });
  }
};

export const createClass = async (req, res) => {
  try {
    const newClass = await Class.create(req.body);
    await notifyTeacherAboutClass(newClass, { action: 'created', source: 'manual' });
    res.status(201).json(newClass);
  } catch (error) {
    handleClassError(res, error);
  }
};

export const updateClass = async (req, res) => {
  try {
    const updatedClass = await Class.update(req.params.id, req.body);
    if (!updatedClass) {
      return res.status(404).json({ error: 'Class not found' });
    }
    await notifyTeacherAboutClass(updatedClass, { action: 'updated', source: 'manual' });
    res.json(updatedClass);
  } catch (error) {
    const status = error.status || 500;
    const message = error.status === 400 ? 'Schedule conflict: teacher already has a class at this time' : 'Failed to update class';
    res.status(status).json({ error: message });
  }
};

export const deleteClass = async (req, res) => {
  try {
    await Class.delete(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete class' });
  }
};

const handleClassError = (res, error) => {
  console.error('Error creating class:', error);

  if (error.message?.includes('SCHEDULE_CONFLICT')) {
    return res.status(400).json({ error: 'Schedule conflict: teacher already has a class at this time' });
  }

  if (error.message?.includes('violates foreign key constraint')) {
    if (error.message?.includes('subject_id')) {
      return res.status(400).json({ error: 'Invalid subject selected. Please ensure the subject exists.' });
    }
    if (error.message?.includes('department_id')) {
      return res.status(400).json({ error: 'Invalid department selected. Please ensure the department exists.' });
    }
    return res.status(400).json({ error: 'Invalid data provided. Please check your selections.' });
  }

  const status = error.status || 500;
  const message = error.status === 400 ? error.message : 'Failed to create class';
  res.status(status).json({ error: message });
};
