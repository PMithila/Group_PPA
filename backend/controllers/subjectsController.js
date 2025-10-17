import { Subject } from '../models/Subject.js';

export const getSubjects = async (req, res) => {
  try {
    const subjects = await Subject.getAll();
    res.json(subjects);
  } catch (error) {
    console.error('Error fetching subjects:', error);
    res.status(500).json({ error: 'Failed to fetch subjects' });
  }
};

export const getSubjectById = async (req, res) => {
  try {
    const { id } = req.params;
    const subject = await Subject.getById(id);

    if (!subject) {
      return res.status(404).json({ error: 'Subject not found' });
    }

    res.json(subject);
  } catch (error) {
    console.error('Error fetching subject:', error);
    res.status(500).json({ error: 'Failed to fetch subject' });
  }
};

export const getSubjectsByDepartment = async (req, res) => {
  try {
    const { departmentId } = req.params;
    const subjects = await Subject.getByDepartment(departmentId);
    res.json(subjects);
  } catch (error) {
    console.error('Error fetching subjects by department:', error);
    res.status(500).json({ error: 'Failed to fetch subjects by department' });
  }
};

export const searchSubjects = async (req, res) => {
  try {
    const { term } = req.params;
    const subjects = await Subject.search(term);
    res.json(subjects);
  } catch (error) {
    console.error('Error searching subjects:', error);
    res.status(500).json({ error: 'Failed to search subjects' });
  }
};

export const createSubject = async (req, res) => {
  try {
    const { code, name, description, department_id } = req.body;

    if (!code || !name) {
      return res.status(400).json({ error: 'Code and name are required' });
    }

    const subject = await Subject.create({
      code,
      name,
      description,
      department_id
    });

    res.status(201).json(subject);
  } catch (error) {
    console.error('Error creating subject:', error);

    if (error.code === '23505') {
      return res.status(400).json({ error: 'Subject code already exists' });
    }

    res.status(500).json({ error: 'Failed to create subject' });
  }
};

export const updateSubject = async (req, res) => {
  try {
    const { id } = req.params;
    const { code, name, description, department_id } = req.body;

    if (!code || !name) {
      return res.status(400).json({ error: 'Code and name are required' });
    }

    const subject = await Subject.update(id, {
      code,
      name,
      description,
      department_id
    });

    if (!subject) {
      return res.status(404).json({ error: 'Subject not found' });
    }

    res.json(subject);
  } catch (error) {
    console.error('Error updating subject:', error);

    if (error.code === '23505') {
      return res.status(400).json({ error: 'Subject code already exists' });
    }

    res.status(500).json({ error: 'Failed to update subject' });
  }
};

export const deleteSubject = async (req, res) => {
  try {
    const { id } = req.params;
    await Subject.delete(id);
    res.json({ message: 'Subject deleted successfully' });
  } catch (error) {
    console.error('Error deleting subject:', error);
    res.status(500).json({ error: 'Failed to delete subject' });
  }
};
