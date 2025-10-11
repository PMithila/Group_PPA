// api.js
import axios from "axios";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:8000";

const instance = axios.create({
  baseURL: API_BASE,
});

// Ensure this is the same instance used throughout the app
console.log('Axios instance created:', instance);

export function setToken(token) {
  console.log('Setting token in axios instance:', token ? 'Token present' : 'No token');
  if (token) {
    instance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    console.log('Authorization header set:', instance.defaults.headers.common["Authorization"]);
  } else {
    delete instance.defaults.headers.common["Authorization"];
    console.log('Authorization header removed');
  }
  // Save token to localStorage for persistence
  if (token) localStorage.setItem('stms_token', token);
  else localStorage.removeItem('stms_token');
}

export function getToken() {
  // Retrieve token from localStorage
  return localStorage.getItem('stms_token');
}

export async function register(email, password, name = null, department = null, role = 'teacher') {
  const res = await instance.post("/auth/register", { email, password, name, department, role });
  return res.data;
}

export async function login(email, password) {
  const res = await instance.post("/auth/token", { email, password });
  return res.data;
}
export async function uploadCSV(file) {
  const fd = new FormData();
  fd.append("file", file);
  const res = await instance.post("/upload", fd, { headers: {"Content-Type":"multipart/form-data"} });
  return res.data;
}
export async function search(query) {
  const res = await instance.get("/api/search", { params: { q: query } });
  return res.data;
}

export async function updateCurrentUserProfile(userData) {
  const res = await instance.put("/auth/profile", userData);
  return res.data;
}

// Classes API
export async function getClasses() {
  console.log('Making getClasses API call, axios instance headers:', instance.defaults.headers.common);
  const res = await instance.get("/api/classes");
  return res.data;
}

export const getLabSessions = async () => {
  try {
    const res = await instance.get("/api/labs");
    return res.data;
  } catch (error) {
    console.error('Error fetching lab sessions:', error);
    throw error;
  }
};

export async function createClass(classData) {
  const res = await instance.post("/api/classes", classData);
  return res.data;
}

export async function updateClass(id, classData) {
  const res = await instance.put(`/api/classes/${id}`, classData);
  return res.data;
}

export async function deleteClass(id) {
  const res = await instance.delete(`/api/classes/${id}`);
  return res.data;
}

// Subjects API
export async function getSubjects() {
  const res = await instance.get("/api/subjects");
  return res.data;
}

export async function getSubjectById(id) {
  const res = await instance.get(`/api/subjects/${id}`);
  return res.data;
}

export async function getSubjectsByDepartment(departmentId) {
  const res = await instance.get(`/api/subjects/department/${departmentId}`);
  return res.data;
}

export async function searchSubjects(term) {
  const res = await instance.get(`/api/subjects/search/${term}`);
  return res.data;
}

export async function createSubject(subjectData) {
  const res = await instance.post("/api/subjects", subjectData);
  return res.data;
}

export async function updateSubject(id, subjectData) {
  const res = await instance.put(`/api/subjects/${id}`, subjectData);
  return res.data;
}

export async function deleteSubject(id) {
  const res = await instance.delete(`/api/subjects/${id}`);
  return res.data;
}

// Departments API
export async function getDepartments() {
  const res = await instance.get("/api/departments");
  return res.data;
}

export async function getDepartmentsWithStats() {
  const res = await instance.get("/api/departments/stats");
  return res.data;
}

export async function getDepartmentById(id) {
  const res = await instance.get(`/api/departments/${id}`);
  return res.data;
}

export async function getDepartmentByCode(code) {
  const res = await instance.get(`/api/departments/code/${code}`);
  return res.data;
}

export async function searchDepartments(term) {
  const res = await instance.get(`/api/departments/search/${term}`);
  return res.data;
}

export async function createDepartment(departmentData) {
  const res = await instance.post("/api/departments", departmentData);
  return res.data;
}

export async function updateDepartment(id, departmentData) {
  const res = await instance.put(`/api/departments/${id}`, departmentData);
  return res.data;
}

export async function deleteDepartment(id) {
  const res = await instance.delete(`/api/departments/${id}`);
  return res.data;
}

// Labs API
export async function getLabs() {
  const res = await instance.get("/api/labs");
  return res.data;
}

export async function createLab(labData) {
  const res = await instance.post("/api/labs", labData);
  return res.data;
}

export async function updateLab(id, labData) {
  const res = await instance.put(`/api/labs/${id}`, labData);
  return res.data;
}

export async function deleteLab(id) {
  const res = await instance.delete(`/api/labs/${id}`);
  return res.data;
}

// Teachers API (from users)
export async function getTeachers() {
  console.log('Making getTeachers API call, axios instance headers:', instance.defaults.headers.common);
  const res = await instance.get("/auth/teachers");
  return res.data;
}

// User Management API
export async function getUsers() {
  const res = await instance.get("/auth/users");
  return res.data;
}

export async function createUser(userData) {
  const res = await instance.post("/auth/users", userData);
  return res.data;
}

export async function updateUser(id, userData) {
  const res = await instance.put(`/auth/users/${id}`, userData);
  return res.data;
}

export async function deleteUser(id) {
  const res = await instance.delete(`/auth/users/${id}`);
  return res.data;
}

export { instance };
