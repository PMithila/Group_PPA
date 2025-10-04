// api.js
import axios from "axios";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:8000";

const instance = axios.create({
  baseURL: API_BASE,
});

export function setToken(token) {
  if (token) instance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  else delete instance.defaults.headers.common["Authorization"];
  // Save token to localStorage for persistence
  if (token) localStorage.setItem('stms_token', token);
  else localStorage.removeItem('stms_token');
}

export function getToken() {
  // Retrieve token from localStorage
  return localStorage.getItem('stms_token');
}

export async function register(email, password, name = null) {
  const res = await instance.post("/auth/register", { email, password, name });
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
export async function runScheduler(algorithm="heuristic") {
  const res = await instance.post("/run_scheduler", null, { params: { algorithm } });
  return res.data;
}

// Classes API
export async function getClasses() {
  const res = await instance.get("/api/classes");
  return res.data;
}

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

// Faculty API
export async function getFaculty() {
  const res = await instance.get("/api/faculty");
  return res.data;
}

export async function createFaculty(facultyData) {
  const res = await instance.post("/api/faculty", facultyData);
  return res.data;
}

export async function updateFaculty(id, facultyData) {
  const res = await instance.put(`/api/faculty/${id}`, facultyData);
  return res.data;
}

export async function deleteFaculty(id) {
  const res = await instance.delete(`/api/faculty/${id}`);
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
