import { Department } from '../models/Department.js';
import { User } from '../models/User.js';

const normalizeRole = (role) => (role || '').toLowerCase();

const resolveHeadTeacher = async ({
  rawHeadId,
  contactEmail,
  excludeDepartmentId = null
}) => {
  const trimmedEmail = contactEmail?.trim() || '';

  if (rawHeadId === null || rawHeadId === undefined || rawHeadId === '' || rawHeadId === 'null') {
    return {
      headTeacherId: null,
      headTeacherName: null,
      contactEmail: trimmedEmail
    };
  }

  const parsedId = Number(rawHeadId);
  if (!Number.isInteger(parsedId) || parsedId <= 0) {
    return {
      error: 'Invalid department head selection.'
    };
  }

  const teacher = await User.findById(parsedId);
  if (!teacher) {
    return {
      error: 'Selected teacher could not be found.'
    };
  }

  if (normalizeRole(teacher.role) !== 'teacher') {
    return {
      error: 'Selected user is not a teacher.'
    };
  }

  const alreadyAssigned = await Department.isHeadAssigned(parsedId, excludeDepartmentId);
  if (alreadyAssigned) {
    return {
      error: 'This teacher is already assigned as head of another department.'
    };
  }

  return {
    headTeacherId: parsedId,
    headTeacherName: teacher.name || teacher.email || '',
    contactEmail: trimmedEmail || teacher.email || ''
  };
};

export const getDepartments = async (req, res) => {
  try {
    const departments = await Department.getAll();
    res.json(departments);
  } catch (error) {
    console.error('Error fetching departments:', error);
    res.status(500).json({ error: 'Failed to fetch departments' });
  }
};

export const getDepartmentStats = async (req, res) => {
  try {
    const departments = await Department.getWithStats();
    res.json(departments);
  } catch (error) {
    console.error('Error fetching department stats:', error);
    res.status(500).json({ error: 'Failed to fetch department statistics' });
  }
};

export const getDepartmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const department = await Department.getById(id);

    if (!department) {
      return res.status(404).json({ error: 'Department not found' });
    }

    res.json(department);
  } catch (error) {
    console.error('Error fetching department:', error);
    res.status(500).json({ error: 'Failed to fetch department' });
  }
};

export const getDepartmentByCode = async (req, res) => {
  try {
    const { code } = req.params;
    const department = await Department.getByCode(code);

    if (!department) {
      return res.status(404).json({ error: 'Department not found' });
    }

    res.json(department);
  } catch (error) {
    console.error('Error fetching department by code:', error);
    res.status(500).json({ error: 'Failed to fetch department' });
  }
};

export const searchDepartments = async (req, res) => {
  try {
    const { term } = req.params;
    const departments = await Department.search(term);
    res.json(departments);
  } catch (error) {
    console.error('Error searching departments:', error);
    res.status(500).json({ error: 'Failed to search departments' });
  }
};

export const createDepartment = async (req, res) => {
  try {
    const {
      code,
      name,
      description,
      head_of_department_id,
      head_of_department,
      contact_email
    } = req.body;

    if (!code || !name) {
      return res.status(400).json({ error: 'Code and name are required' });
    }

    if (head_of_department && !head_of_department_id) {
      return res.status(400).json({ error: 'Please select a department head from the teacher list.' });
    }

    const headResolution = await resolveHeadTeacher({
      rawHeadId: head_of_department_id,
      contactEmail: contact_email
    });

    if (headResolution.error) {
      return res.status(400).json({ error: headResolution.error });
    }

    const department = await Department.create({
      code,
      name,
      description,
      head_of_department: headResolution.headTeacherName || null,
      head_of_department_id: headResolution.headTeacherId,
      contact_email: headResolution.contactEmail || null
    });

    res.status(201).json(department);
  } catch (error) {
    console.error('Error creating department:', error);

    if (error.code === '23505') {
      return res.status(400).json({ error: 'Department code already exists' });
    }

    res.status(500).json({ error: 'Failed to create department' });
  }
};

export const updateDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      code,
      name,
      description,
      head_of_department_id,
      head_of_department,
      contact_email
    } = req.body;

    if (!code || !name) {
      return res.status(400).json({ error: 'Code and name are required' });
    }

    if (head_of_department && !head_of_department_id) {
      return res.status(400).json({ error: 'Please select a department head from the teacher list.' });
    }

    const headResolution = await resolveHeadTeacher({
      rawHeadId: head_of_department_id,
      contactEmail: contact_email,
      excludeDepartmentId: Number(id)
    });

    if (headResolution.error) {
      return res.status(400).json({ error: headResolution.error });
    }

    const department = await Department.update(id, {
      code,
      name,
      description,
      head_of_department: headResolution.headTeacherName || null,
      head_of_department_id: headResolution.headTeacherId,
      contact_email: headResolution.contactEmail || null
    });

    if (!department) {
      return res.status(404).json({ error: 'Department not found' });
    }

    res.json(department);
  } catch (error) {
    console.error('Error updating department:', error);

    if (error.code === '23505') {
      return res.status(400).json({ error: 'Department code already exists' });
    }

    res.status(500).json({ error: 'Failed to update department' });
  }
};

export const deleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    await Department.delete(id);
    res.json({ message: 'Department deleted successfully' });
  } catch (error) {
    console.error('Error deleting department:', error);
    res.status(500).json({ error: 'Failed to delete department' });
  }
};
