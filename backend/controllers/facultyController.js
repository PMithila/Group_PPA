import Faculty from '../models/Faculty.js';
import { Department } from '../models/Department.js';
import Class from '../models/Class.js';
import { User } from '../models/User.js';

const normalizeRole = (role) => (role || '').toLowerCase();

const mapTeacherClassSubjects = (classes = []) => {
  const map = new Map();
  classes.forEach((cls) => {
    if (!cls?.teacher) return;
    const key = cls.teacher.trim().toLowerCase();
    if (!map.has(key)) {
      map.set(key, new Set());
    }
    const label = cls.subject_name || cls.name || cls.code || 'Class';
    map.get(key).add(label);
  });
  return map;
};

const assignClassesToTeachers = async (teachers) => {
  const classes = await Class.getAll();
  const subjectMap = mapTeacherClassSubjects(classes);

  return teachers.map((teacher) => {
    const key = teacher.name ? teacher.name.trim().toLowerCase() : '';
    const subjects = key && subjectMap.has(key)
      ? Array.from(subjectMap.get(key)).sort()
      : [];
    return {
      ...teacher,
      classesTaught: subjects
    };
  });
};

const assignDepartmentsToTeachers = async (teachers) => {
  const deptRows = await Department.getAll();
  const deptMap = new Map();
  deptRows.forEach((dept) => {
    if (!dept.head_of_department_id) return;
    const set = deptMap.get(dept.head_of_department_id) || [];
    set.push({ id: dept.id, name: dept.name, code: dept.code });
    deptMap.set(dept.head_of_department_id, set);
  });

  return teachers.map((teacher) => {
    const departments = deptMap.get(teacher.id) || [];
    return {
      ...teacher,
      departments
    };
  });
};

export const getFaculty = async (req, res) => {
  try {
    const teachers = await User.getAllTeachers();
    const teachersWithDepartments = await assignDepartmentsToTeachers(teachers);
    const enrichedTeachers = await assignClassesToTeachers(teachersWithDepartments);
    res.json(enrichedTeachers);
  } catch (error) {
    res.status(500).json({ message: 'Failed to get faculty', error: error.message });
  }
};

export const createFaculty = async (req, res) => {
  try {
    const newFaculty = await Faculty.create(req.body);
    res.status(201).json(newFaculty);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create faculty', error: error.message });
  }
};

export const updateFaculty = async (req, res) => {
  try {
    const updatedFaculty = await Faculty.update(req.params.id, req.body);
    if (!updatedFaculty) {
      return res.status(404).json({ message: 'Faculty not found' });
    }
    res.json(updatedFaculty);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update faculty', error: error.message });
  }
};

export const deleteFaculty = async (req, res) => {
  try {
    const deleted = await Faculty.delete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Faculty not found' });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete faculty', error: error.message });
  }
};
