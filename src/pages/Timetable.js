// src/pages/Timetable.js
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";

export default function Timetable() {
  const grades = [
    { id: 6, name: "Grade 6" },
    { id: 7, name: "Grade 7" },
    { id: 8, name: "Grade 8" },
    { id: 9, name: "Grade 9" },
    { id: 10, name: "Grade 10" },
    { id: 11, name: "Grade 11" },
  ];

  const divisions = ["Division A", "Division B", "Division C", "Division D", "Division E", "Division F"];
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const timeSlots = [
    "7:40 - 8:20",
    "8:20 - 9:00",
    "9:00 - 9:40",
    "9:40 - 10:20",
    "10:20 - 11:00 (Break)",
    "11:00 - 11:40",
    "11:40 - 12:20",
    "12:20 - 12:30",
    "12:30 - 1:30",
  ];
  const subjects = ["Maths", "English", "Tamil", "History", "Science", "ICT", "Civic", "Geography", "PE", "Music", "Art"];

  const colors = {
    primary: "#0f172a",
    white: "#fff",
    breakRed: "#dc3545",
    green: "#28a745",
    blueBtn: "#1d4ed8",
    red: "#dc3545",
    lightGray: "#f1f5f9",
    tableHeader: "#2563eb",
  };

  const [selectedGrade, setSelectedGrade] = useState(null);
  const [selectedDivision, setSelectedDivision] = useState(null);

  const generateInitialTimetable = () => {
    const tt = {};
    grades.forEach((g) => {
      tt[g.id] = {};
      divisions.forEach((d) => {
        tt[g.id][d] = {};
        timeSlots.forEach((t) => {
          tt[g.id][d][t] = {};
          days.forEach((day) => {
            tt[g.id][d][t][day] = t.includes("Break") ? "Break" : subjects[Math.floor(Math.random() * subjects.length)];
          });
        });
      });
    });
    return tt;
  };

  const [timetables, setTimetables] = useState(generateInitialTimetable);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [formDay, setFormDay] = useState(days[0]);
  const [formTime, setFormTime] = useState(0);
  const [formSubject, setFormSubject] = useState(subjects[0]);

  const openModal = (mode) => {
    if (!selectedGrade || !selectedDivision) { 
      alert("Select Grade and Division first."); 
      return; 
    }
    setModalMode(mode);
    setFormDay(days[0]);
    setFormTime(0);
    setFormSubject(subjects[0]);
    setModalVisible(true);
  };

  const closeModal = () => setModalVisible(false);

  const handleSave = () => {
    setTimetables(prev => {
      const copy = { ...prev };
      copy[selectedGrade.id] = { ...prev[selectedGrade.id] };
      copy[selectedGrade.id][selectedDivision] = { ...prev[selectedGrade.id][selectedDivision] };
      copy[selectedGrade.id][selectedDivision][timeSlots[formTime]] = { ...prev[selectedGrade.id][selectedDivision][timeSlots[formTime]] };
      if (modalMode === "delete") {
        copy[selectedGrade.id][selectedDivision][timeSlots[formTime]][formDay] = "";
      } else {
        copy[selectedGrade.id][selectedDivision][timeSlots[formTime]][formDay] = formSubject;
      }
      return copy;
    });
    closeModal();
  };

  const location = useLocation();

  // Styles
  const boxStyle = (active) => ({
    backgroundColor: colors.blueBtn,
    color: "#fff",
    border: `3px solid ${colors.blueBtn}`,
    borderRadius: 25,
    height: 180,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 28,
    fontWeight: 700,
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 6px 14px rgba(0,0,0,0.1)",
  });

  const tableContainer = { background: colors.white, borderRadius: 12, padding: 18, boxShadow: "0 6px 18px rgba(0,0,0,0.1)", marginTop: 30 };
  const table = { width: "100%", borderCollapse: "collapse", fontSize: 14 };
  const th = { background: colors.tableHeader, color: colors.white, padding: 12, textAlign: "center", position: "sticky", top: 0 };
  const td = { padding: 10, textAlign: "center", borderBottom: "1px solid #e0e0e0" };
  const actionsRow = { display: "flex", justifyContent: "center", gap: 15, marginTop: 20 };
  const actionBtn = (bg) => ({ backgroundColor: bg, color: "#fff", padding: "10px 20px", borderRadius: 8, border: "none", cursor: "pointer", fontWeight: 700 });

  return (
    <div style={{ minHeight: "100vh", fontFamily: "Inter, Arial, sans-serif", background: colors.lightGray, position: "relative", paddingTop: "80px" }}>
      
      {/* Restored Original Navbar */}
      <nav className="navbar" style={{ position: "fixed", top: 0, width: "100%", backgroundColor: "#1E293B", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 30px", zIndex: 100 }}>
        <div style={{ fontWeight: "bold", fontSize: 22, color: "#fff" }}>Austrosoft</div>
        <div style={{ display: "flex", gap: 25 }}>
          {["Home", "Timetable", "Staff", "Subject", "Leave"].map(page => (
            <Link
              key={page}
              to={`/${page.toLowerCase()}`}
              style={{
                color: location.pathname === `/${page.toLowerCase()}` ? "#1d4ed8" : "#fff",
                fontWeight: location.pathname === `/${page.toLowerCase()}` ? "bold" : "normal",
                textDecoration: "none",
                padding: "6px 12px",
                borderRadius: 6,
                transition: "0.3s",
                backgroundColor: location.pathname === `/${page.toLowerCase()}` ? "#fff" : "transparent"
              }}
            >
              {page}
            </Link>
          ))}
        </div>
        <Link
          to="/signin"
          style={{ backgroundColor: "#dc3545", padding: "8px 16px", color: "#fff", borderRadius: 8, fontWeight: "bold", textDecoration: "none" }}
        >
          Logout
        </Link>
      </nav>

      {/* Header */}
      <motion.h1
        style={{ textAlign: "center", color: colors.primary, fontSize: 52, fontWeight: 900, marginBottom: 30 }}
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
      >
        Timetable
        <motion.div
          style={{ height: "4px", width: "0%", background: colors.blueBtn, margin: "10px auto", borderRadius: "2px" }}
          animate={{ width: "60%" }}
          transition={{ duration: 1.5 }}
        />
      </motion.h1>

      {/* Grade Selection */}
      {!selectedGrade && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 60, maxWidth: 900, margin: "50px auto" }}>
          {grades.map((g) => (
            <div
              key={g.id}
              style={boxStyle(false)}
              onClick={() => { setSelectedGrade(g); setSelectedDivision(null); }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = colors.white; e.currentTarget.style.color = colors.blueBtn; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = colors.blueBtn; e.currentTarget.style.color = "#fff"; }}
            >
              {g.name}
            </div>
          ))}
        </div>
      )}

      {/* Division Selection */}
      {selectedGrade && !selectedDivision && (
        <div style={{ maxWidth: 900, margin: "50px auto", textAlign: "center" }}>
          <button style={actionBtn(colors.blueBtn)} onClick={() => setSelectedGrade(null)}>Back to Grades</button>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 60, marginTop: 30 }}>
            {divisions.map((d) => (
              <div
                key={d}
                style={boxStyle(false)}
                onClick={() => setSelectedDivision(d)}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = colors.white; e.currentTarget.style.color = colors.blueBtn; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = colors.blueBtn; e.currentTarget.style.color = "#fff"; }}
              >
                {d}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Timetable Table */}
      {selectedGrade && selectedDivision && (
        <div style={{ padding: 24, maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h2 style={{ color: colors.primary }}>{selectedGrade.name} — {selectedDivision} Timetable</h2>
            <div style={{ display: "flex", gap: 10 }}>
              <button style={actionBtn(colors.blueBtn)} onClick={() => setSelectedDivision(null)}>Back to Divisions</button>
              <button style={actionBtn(colors.blueBtn)} onClick={() => setSelectedGrade(null)}>Back to Grades</button>
            </div>
          </div>

          <div style={tableContainer}>
            <table style={table}>
              <thead>
                <tr>
                  <th style={th}>Time / Day</th>
                  {days.map((d) => <th key={d} style={th}>{d}</th>)}
                </tr>
              </thead>
              <tbody>
                {timeSlots.map((t, i) => (
                  <tr key={i}>
                    <td style={{ ...td, fontWeight: 700 }}>{t}</td>
                    {days.map((day) => (
                      <td key={day} style={{ ...td, backgroundColor: t.includes("Break") ? colors.breakRed : "#fff", color: t.includes("Break") ? "#fff" : "#000" }}>
                        {timetables[selectedGrade.id][selectedDivision][t][day]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Actions */}
            <div style={actionsRow}>
              <button style={actionBtn(colors.green)} onClick={() => openModal("add")}>Add</button>
              <button style={actionBtn(colors.blueBtn)} onClick={() => openModal("edit")}>Edit</button>
              <button style={actionBtn(colors.red)} onClick={() => openModal("delete")}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      {modalVisible && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 200
          }}
        >
          <div style={{ background: colors.white, borderRadius: 12, width: 400, padding: 20 }}>
            <h2>{modalMode === "add" ? "Add Subject" : modalMode === "edit" ? "Edit Subject" : "Delete Subject"}</h2>
            <label>Day</label>
            <select value={formDay} onChange={(e) => setFormDay(e.target.value)} style={{ width: "100%", padding: 8, margin: "5px 0 10px" }}>
              {days.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
            <label>Time</label>
            <select value={formTime} onChange={(e) => setFormTime(Number(e.target.value))} style={{ width: "100%", padding: 8, margin: "5px 0 10px" }}>
              {timeSlots.map((t, idx) => <option key={idx} value={idx}>{t}</option>)}
            </select>
            {modalMode !== "delete" && (
              <>
                <label>Subject</label>
                <select value={formSubject} onChange={(e) => setFormSubject(e.target.value)} style={{ width: "100%", padding: 8, margin: "5px 0 10px" }}>
                  {subjects.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </>
            )}
            <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
              <button style={actionBtn(modalMode === "delete" ? colors.red : colors.green)} onClick={handleSave}>
                {modalMode === "delete" ? "Delete" : "Save"}
              </button>
              <button style={actionBtn("#6c757d")} onClick={closeModal}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
