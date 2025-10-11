// src/pages/SubjectDetails.js
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";

export default function SubjectDetails() {
  const navigate = useNavigate();
  const location = useLocation();

  const colors = {
    primary: "#0f172a",
    secondary: "#1e40af",
    lightGray: "#f8fafc",
    cardBg: "#e0f2fe",
    cardText: "#0f172a",
  };

  // Sri Lankan subjects with multiple teachers
  const subjectData = {
    "Grade 6": [
      { name: "Sinhala", teachers: ["Miss. Priyani Perera", "Mr. Nimal Silva"] },
      { name: "English", teachers: ["Mr. Ananda Silva", "Miss. Ishara Fernando"] },
      { name: "Mathematics", teachers: ["Miss. Kumari Jayasinghe", "Mr. Sunil Perera"] },
      { name: "Science", teachers: ["Mr. Ruwan Fernando", "Miss. Sanduni Hettiarachchi"] },
      { name: "History", teachers: ["Miss. Nadeesha Wijesinghe", "Mr. Chathura Rajapakse"] },
      { name: "Geography", teachers: ["Miss. Anushka Perera", "Mr. Lasantha Jayawardena"] },
      { name: "Civics", teachers: ["Miss. Malika Fernando", "Mr. Hiran Silva"] },
      { name: "Religion", teachers: ["Miss. Thilini Jayasinghe", "Mr. Chamara Fernando"] },
    ],
    "Grade 7": [
      { name: "Sinhala", teachers: ["Miss. Priyani Perera", "Mr. Nimal Silva"] },
      { name: "English", teachers: ["Mr. Ananda Silva", "Miss. Ishara Fernando"] },
      { name: "Mathematics", teachers: ["Miss. Kumari Jayasinghe", "Mr. Sunil Perera"] },
      { name: "Science", teachers: ["Mr. Ruwan Fernando", "Miss. Sanduni Hettiarachchi"] },
      { name: "History", teachers: ["Miss. Nadeesha Wijesinghe", "Mr. Chathura Rajapakse"] },
      { name: "Geography", teachers: ["Miss. Anushka Perera", "Mr. Lasantha Jayawardena"] },
      { name: "Civics", teachers: ["Miss. Malika Fernando", "Mr. Hiran Silva"] },
      { name: "Religion", teachers: ["Miss. Thilini Jayasinghe", "Mr. Chamara Fernando"] },
    ],
    "Grade 8": [
      { name: "Sinhala", teachers: ["Miss. Priyani Perera", "Mr. Nimal Silva"] },
      { name: "English", teachers: ["Mr. Ananda Silva", "Miss. Ishara Fernando"] },
      { name: "Mathematics", teachers: ["Miss. Kumari Jayasinghe", "Mr. Sunil Perera"] },
      { name: "Science", teachers: ["Mr. Ruwan Fernando", "Miss. Sanduni Hettiarachchi"] },
      { name: "History", teachers: ["Miss. Nadeesha Wijesinghe", "Mr. Chathura Rajapakse"] },
      { name: "Geography", teachers: ["Miss. Anushka Perera", "Mr. Lasantha Jayawardena"] },
      { name: "Civics", teachers: ["Miss. Malika Fernando", "Mr. Hiran Silva"] },
      { name: "Religion", teachers: ["Miss. Thilini Jayasinghe", "Mr. Chamara Fernando"] },
    ],
    "Grade 9": [
      { name: "Sinhala", teachers: ["Miss. Priyani Perera", "Mr. Nimal Silva"] },
      { name: "English", teachers: ["Mr. Ananda Silva", "Miss. Ishara Fernando"] },
      { name: "Mathematics", teachers: ["Miss. Kumari Jayasinghe", "Mr. Sunil Perera"] },
      { name: "Science", teachers: ["Mr. Ruwan Fernando", "Miss. Sanduni Hettiarachchi"] },
      { name: "History", teachers: ["Miss. Nadeesha Wijesinghe", "Mr. Chathura Rajapakse"] },
      { name: "Geography", teachers: ["Miss. Anushka Perera", "Mr. Lasantha Jayawardena"] },
      { name: "Civics", teachers: ["Miss. Malika Fernando", "Mr. Hiran Silva"] },
      { name: "Religion", teachers: ["Miss. Thilini Jayasinghe", "Mr. Chamara Fernando"] },
      { name: "Health Education", teachers: ["Miss. Nirosha Fernando"] },
    ],
    "Grade 10": [
      { name: "Sinhala", teachers: ["Miss. Priyani Perera"] },
      { name: "English", teachers: ["Mr. Ananda Silva"] },
      { name: "Mathematics", teachers: ["Miss. Kumari Jayasinghe"] },
      { name: "Science", teachers: ["Mr. Ruwan Fernando", "Miss. Sanduni Hettiarachchi"] },
      { name: "History", teachers: ["Miss. Nadeesha Wijesinghe"] },
      { name: "Geography", teachers: ["Miss. Anushka Perera"] },
      { name: "Civics", teachers: ["Miss. Malika Fernando"] },
      { name: "Religion", teachers: ["Miss. Thilini Jayasinghe"] },
      { name: "Economics", teachers: ["Miss. Chamari Jayawardena"] },
      { name: "Business Studies", teachers: ["Mr. Kasun Perera"] },
      { name: "ICT", teachers: ["Mr. Prasanna Fernando"] },
    ],
    "Grade 11": [
      { name: "Sinhala", teachers: ["Miss. Priyani Perera"] },
      { name: "English", teachers: ["Mr. Ananda Silva"] },
      { name: "Mathematics", teachers: ["Miss. Kumari Jayasinghe"] },
      { name: "Science", teachers: ["Mr. Ruwan Fernando", "Miss. Sanduni Hettiarachchi"] },
      { name: "History", teachers: ["Miss. Nadeesha Wijesinghe"] },
      { name: "Geography", teachers: ["Miss. Anushka Perera"] },
      { name: "Civics", teachers: ["Miss. Malika Fernando"] },
      { name: "Religion", teachers: ["Miss. Thilini Jayasinghe"] },
      { name: "Economics", teachers: ["Miss. Chamari Jayawardena"] },
      { name: "Business Studies", teachers: ["Mr. Kasun Perera"] },
      { name: "ICT", teachers: ["Mr. Prasanna Fernando"] },
    ],
  };

  return (
    <div style={{ minHeight: "100vh", fontFamily: "Inter, Arial, sans-serif", background: colors.lightGray, paddingTop: "80px" }}>
      {/* Navbar */}
      <nav style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "60px", background: colors.primary, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px", color: "#fff", zIndex: 100 }}>
        <div style={{ fontWeight: "bold", fontSize: "22px", cursor: "pointer" }} onClick={() => navigate("/home")}>Austrosoft</div>
        <div style={{ display: "flex", gap: "15px", margin: "0 auto" }}>
          {["Home", "Timetable", "Staff", "Subject", "Leave Request"].map((page) => (
            <button key={page} onClick={() => navigate(`/${page.toLowerCase().replace(" ", "")}`)}
              style={{
                padding: "8px 18px",
                borderRadius: "10px",
                fontWeight: "bold",
                border: "none",
                background: location.pathname === `/${page.toLowerCase().replace(" ", "")}` ? colors.secondary : "transparent",
                color: location.pathname === `/${page.toLowerCase().replace(" ", "")}` ? colors.white : "#fff",
                cursor: "pointer",
                transition: "all 0.3s ease"
              }}
            >
              {page}
            </button>
          ))}
        </div>
      </nav>

      {/* Page Title */}
      <div style={{ textAlign: "center", marginBottom: "50px" }}>
        <h1 style={{ color: colors.primary, fontSize: "36px", fontWeight: "700" }}>Subject Details</h1>
        <div style={{ height: "4px", width: "120px", background: colors.secondary, margin: "10px auto", borderRadius: "2px" }} />
      </div>

      {/* Grades & Subjects */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 20px" }}>
        {Object.keys(subjectData).map((grade) => (
          <div key={grade} style={{ marginBottom: "50px", textAlign: "center" }}>
            <h2 style={{ color: colors.primary, fontSize: "28px", fontWeight: "600", marginBottom: "20px" }}>
              {grade}
            </h2>
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "20px" }}>
              {subjectData[grade].map((sub, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.05, boxShadow: "0 10px 20px rgba(0,0,0,0.15)" }}
                  style={{
                    background: colors.cardBg,
                    color: colors.cardText,
                    padding: "20px 25px",
                    borderRadius: "12px",
                    minWidth: "180px",
                    maxWidth: "240px",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                  }}
                >
                  <h3 style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "10px" }}>{sub.name}</h3>
                  {sub.teachers.map((t, i) => (
                    <p key={i} style={{ fontSize: "14px", color: "#334155", margin: "3px 0" }}>{t}</p>
                  ))}
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
