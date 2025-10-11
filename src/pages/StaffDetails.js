// src/pages/StaffDetails.js
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";

// Staff Data
const staffData = {
  principal: [
    {
      id: 1,
      title: "Dr.",
      name: "Arul Kumar",
      degree: "PhD",
      phone: "+94770000001",
      study:
        "BSc in Computer Science, University of Colombo; MSc in AI, University of Peradeniya; PhD in Accounting, University of Jaffna",
      workSummary: "Led academic programs and school development",
      experience: "15 years",
      projects: "Curriculum and research projects",
    },
  ],
  vicePrincipal: [
    {
      id: 2,
      title: "Dr.",
      name: "Meena Selvan",
      degree: "PhD",
      phone: "+94770000002",
      study:
        "BSc in Mathematics, University of Colombo; MSc in Education, University of Peradeniya; PhD in Leadership, University of Jaffna",
      workSummary: "Oversaw academic planning and staff management",
      experience: "12 years",
      projects: "Staff training and student guidance",
    },
  ],
  teachers: [
    {
      id: 3,
      title: "Mr.",
      name: "Karthik Ramesh",
      degree: "MSc in IT",
      phone: "+94770100003",
      study: "BSc in Computer Science, University of Colombo; MSc in IT, University of Peradeniya",
      workSummary: "Teaching software engineering",
      experience: "5 years",
      projects: "Coding projects",
    },
    {
      id: 4,
      title: "Miss",
      name: "Nithya Anandhan",
      degree: "MSc in Mathematics",
      phone: "+94770100004",
      study: "BSc in Mathematics, University of Colombo; MSc in Mathematics, University of Peradeniya",
      workSummary: "Teaching mathematics",
      experience: "6 years",
      projects: "Math Olympiad coaching",
    },
    {
      id: 5,
      title: "Mr.",
      name: "Praveen Selvaraj",
      degree: "MSc in Physics",
      phone: "+94770100005",
      study: "BSc in Physics, University of Colombo; MSc in Physics, University of Peradeniya",
      workSummary: "Teaching physics",
      experience: "7 years",
      projects: "Physics lab experiments",
    },
    {
      id: 6,
      title: "Miss",
      name: "Anjali Perera",
      degree: "MSc in Chemistry",
      phone: "+94770100006",
      study: "BSc in Chemistry, University of Colombo; MSc in Chemistry, University of Peradeniya",
      workSummary: "Teaching chemistry",
      experience: "8 years",
      projects: "Lab experiments",
    },
    {
      id: 7,
      title: "Mr.",
      name: "Ravi Fernando",
      degree: "MEd in ICT",
      phone: "+94770100007",
      study: "BEd in Computer Science, University of Colombo; MEd in IT, University of Peradeniya",
      workSummary: "ICT teacher",
      experience: "9 years",
      projects: "Coding competitions",
    },
    {
      id: 8,
      title: "Miss",
      name: "Sangeetha Nadaraja",
      degree: "MEd in Math",
      phone: "+94770100008",
      study: "BEd in Mathematics, University of Colombo; MEd in Mathematics, University of Peradeniya",
      workSummary: "Mathematics teacher",
      experience: "6 years",
      projects: "Math projects",
    },
    {
      id: 9,
      title: "Mr.",
      name: "Dinesh Wijesinghe",
      degree: "MSc in Biology",
      phone: "+94770100009",
      study: "BSc in Biology, University of Colombo; MSc in Biology, University of Peradeniya",
      workSummary: "Biology teacher",
      experience: "4 years",
      projects: "Research projects",
    },
    {
      id: 10,
      title: "Miss",
      name: "Priya Silva",
      degree: "MEd in Physics",
      phone: "+94770100010",
      study: "BEd in Physics, University of Colombo; MEd in Physics, University of Peradeniya",
      workSummary: "Physics teacher",
      experience: "5 years",
      projects: "Lab experiments",
    },
    {
      id: 11,
      title: "Mr.",
      name: "Hiran Jayasinghe",
      degree: "MSc in Chemistry",
      phone: "+94770100011",
      study: "BSc in Chemistry, University of Colombo; MSc in Chemistry, University of Peradeniya",
      workSummary: "Chemistry teacher",
      experience: "6 years",
      projects: "Science projects",
    },
    {
      id: 12,
      title: "Miss",
      name: "Nadeesha Perera",
      degree: "MEd in ICT",
      phone: "+94770100012",
      study: "BEd in ICT, University of Colombo; MEd in IT, University of Peradeniya",
      workSummary: "ICT teacher",
      experience: "7 years",
      projects: "Coding competitions",
    },
    {
      id: 13,
      title: "Mr.",
      name: "Suresh De Silva",
      degree: "MSc in Mathematics",
      phone: "+94770100013",
      study: "BSc in Mathematics, University of Colombo; MSc in Math, University of Peradeniya",
      workSummary: "Mathematics teacher",
      experience: "8 years",
      projects: "Math Olympiad",
    },
    {
      id: 14,
      title: "Miss",
      name: "Kavitha Fernando",
      degree: "MEd in Science",
      phone: "+94770100014",
      study: "BEd in Science, University of Colombo; MEd in Science, University of Peradeniya",
      workSummary: "Science teacher",
      experience: "5 years",
      projects: "Lab experiments",
    },
    {
      id: 15,
      title: "Mr.",
      name: "Ajith Perera",
      degree: "MSc in ICT",
      phone: "+94770100015",
      study: "BSc in ICT, University of Colombo; MSc in ICT, University of Peradeniya",
      workSummary: "ICT teacher",
      experience: "6 years",
      projects: "Coding competitions",
    },
    {
      id: 16,
      title: "Miss",
      name: "Tharushi Silva",
      degree: "MEd in Chemistry",
      phone: "+94770100016",
      study: "BEd in Chemistry, University of Colombo; MEd in Chemistry, University of Peradeniya",
      workSummary: "Chemistry teacher",
      experience: "4 years",
      projects: "Lab projects",
    },
    {
      id: 17,
      title: "Mr.",
      name: "Roshan Fernando",
      degree: "MSc in Biology",
      phone: "+94770100017",
      study: "BSc in Biology, University of Colombo; MSc in Biology, University of Peradeniya",
      workSummary: "Biology teacher",
      experience: "5 years",
      projects: "Research projects",
    },
    {
      id: 18,
      title: "Miss",
      name: "Chathurika Nadaraja",
      degree: "MEd in Mathematics",
      phone: "+94770100018",
      study: "BEd in Mathematics, University of Colombo; MEd in Math, University of Peradeniya",
      workSummary: "Mathematics teacher",
      experience: "6 years",
      projects: "Math Olympiad",
    },
    {
      id: 19,
      title: "Mr.",
      name: "Prasanna Wijesinghe",
      degree: "MSc in Physics",
      phone: "+94770100019",
      study: "BSc in Physics, University of Colombo; MSc in Physics, University of Peradeniya",
      workSummary: "Physics teacher",
      experience: "7 years",
      projects: "Lab experiments",
    },
    {
      id: 20,
      title: "Miss",
      name: "Dilani Perera",
      degree: "MEd in ICT",
      phone: "+94770100020",
      study: "BEd in ICT, University of Colombo; MEd in IT, University of Peradeniya",
      workSummary: "ICT teacher",
      experience: "5 years",
      projects: "Coding workshops",
    },
  ],
  trainingStaff: [
    {
      id: 21,
      title: "Mr.",
      name: "Thiru Selvan",
      degree: "BEd in IT Education",
      phone: "+94770200001",
      study: "BEd in IT Education, University of Jaffna",
      workSummary: "IT trainer",
      experience: "3 years",
      projects: "Coding workshops",
    },
    {
      id: 22,
      title: "Miss",
      name: "Gandhi Nadaraja",
      degree: "BEd in Mathematics",
      phone: "+94770200002",
      study: "BEd in Mathematics, University of Jaffna",
      workSummary: "Math trainer",
      experience: "2 years",
      projects: "Math skill development",
    },
    {
      id: 23,
      title: "Mr.",
      name: "Saman Perera",
      degree: "BEd in Science",
      phone: "+94770200003",
      study: "BEd in Science, University of Colombo",
      workSummary: "Science trainer",
      experience: "4 years",
      projects: "Lab workshops",
    },
    {
      id: 24,
      title: "Miss",
      name: "Nirosha Fernando",
      degree: "BEd in ICT",
      phone: "+94770200004",
      study: "BEd in ICT, University of Peradeniya",
      workSummary: "ICT trainer",
      experience: "3 years",
      projects: "Coding projects",
    },
    {
      id: 25,
      title: "Mr.",
      name: "Roshan Silva",
      degree: "BEd in Mathematics",
      phone: "+94770200005",
      study: "BEd in Mathematics, University of Colombo",
      workSummary: "Math trainer",
      experience: "2 years",
      projects: "Math competitions",
    },
    {
      id: 26,
      title: "Miss",
      name: "Sashika Perera",
      degree: "BEd in Physics",
      phone: "+94770200006",
      study: "BEd in Physics, University of Colombo",
      workSummary: "Physics trainer",
      experience: "3 years",
      projects: "Physics labs",
    },
    {
      id: 27,
      title: "Mr.",
      name: "Dilshan Jayasinghe",
      degree: "BEd in Chemistry",
      phone: "+94770200007",
      study: "BEd in Chemistry, University of Colombo",
      workSummary: "Chemistry trainer",
      experience: "4 years",
      projects: "Chemistry labs",
    },
    {
      id: 28,
      title: "Miss",
      name: "Thilini Silva",
      degree: "BEd in ICT",
      phone: "+94770200008",
      study: "BEd in ICT, University of Colombo",
      workSummary: "ICT trainer",
      experience: "3 years",
      projects: "Coding workshops",
    },
    {
      id: 29,
      title: "Mr.",
      name: "Kamal Perera",
      degree: "BEd in Science",
      phone: "+94770200009",
      study: "BEd in Science, University of Colombo",
      workSummary: "Science trainer",
      experience: "4 years",
      projects: "Science labs",
    },
    {
      id: 30,
      title: "Miss",
      name: "Pavithra Nadaraja",
      degree: "BEd in Mathematics",
      phone: "+94770200010",
      study: "BEd in Mathematics, University of Jaffna",
      workSummary: "Math trainer",
      experience: "2 years",
      projects: "Math workshops",
    },
  ],
};

// Role Colors
const roleColors = {
  principal: "#0f172a",
  vicePrincipal: "#0d47a1",
  teachers: "#1d4ed8",
  trainingStaff: "#2563eb",
};

// Get initials
const getInitials = (title, name) => title[0] + name.split(" ")[0][0];

// Staff Card Component
const StaffCard = ({ staff, role, onClick }) => (
  <motion.div
    onClick={() => onClick(staff)}
    whileHover={{ scale: 1.05 }}
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ type: "spring", stiffness: 200, damping: 20 }}
    style={{
      cursor: "pointer",
      width: "220px",
      borderRadius: "16px",
      padding: "20px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      textAlign: "center",
      margin: "15px",
      background: "#ffffff",
      boxShadow: "0 8px 20px rgba(0,0,0,0.1)",
      borderTop: `5px solid ${roleColors[role]}`,
      position: "relative",
      overflow: "hidden",
    }}
  >
    <div
      style={{
        width: "80px",
        height: "80px",
        borderRadius: "50%",
        background: roleColors[role],
        color: "#fff",
        fontSize: "28px",
        fontWeight: "bold",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: "15px",
        boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
      }}
    >
      {getInitials(staff.title, staff.name)}
    </div>
    <h3 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "5px", color: "#0f172a" }}>
      {staff.title} {staff.name}
    </h3>
    <p style={{ fontSize: "14px", color: "#475569", marginBottom: "10px" }}>{staff.degree}</p>
    <motion.div
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        height: "4px",
        width: "100%",
        background: `linear-gradient(90deg, ${roleColors[role]}, #60a5fa, ${roleColors[role]})`,
        borderRadius: "2px",
      }}
      animate={{ x: ["-100%", "100%"] }}
      transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
    />
  </motion.div>
);

// Staff Section Component
const StaffSection = ({ title, staffList, role, onClick }) => (
  <div style={{ marginBottom: "60px" }}>
    <motion.h2
      style={{ fontSize: "28px", textAlign: "center", marginBottom: "30px", color: roleColors[role] }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {title}
    </motion.h2>
    <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center" }}>
      {staffList.map((staff) => (
        <StaffCard key={staff.id} staff={staff} role={role} onClick={onClick} />
      ))}
    </div>
  </div>
);

// Background Animation
const Background = () => (
  <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", overflow: "hidden", zIndex: 0 }}>
    {[...Array(20)].map((_, i) => (
      <motion.div
        key={i}
        animate={{ y: ["-10%", "110%"], rotate: [0, 360] }}
        transition={{ duration: 25 + i, repeat: Infinity, ease: "linear" }}
        style={{
          position: "absolute",
          width: `${10 + i * 6}px`,
          height: `${10 + i * 6}px`,
          borderRadius: "50%",
          background: "rgba(29,78,216,0.05)",
          top: `${Math.random() * 100}%`,
          left: `${Math.random() * 100}%`,
        }}
      />
    ))}
  </div>
);

// Main Component
export default function StaffDetails() {
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [messages, setMessages] = useState([
    "Welcome Arish!",
    "Every 5 min we get a new message.",
    "System update scheduled tonight.",
    "Check your timetable for changes.",
    "Remember to submit reports on time.",
  ]);

  const navigate = useNavigate();
  const location = useLocation();

  const colors = {
    primary: "#0f172a",
    red: "#dc3545",
    blueBtn: "#1d4ed8",
    white: "#fff",
    lightGray: "#f8fafc",
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setMessages((prev) => [...prev, `New message at ${new Date().toLocaleTimeString()}`]);
    }, 300000);
    return () => clearInterval(interval);
  }, []);

  const toggleNotifications = () => setShowNotifications(!showNotifications);
  const closeMessage = (index) => setMessages((prev) => prev.filter((_, i) => i !== index));
  const handleLogout = () => { if (window.confirm("Are you sure you want to log out?")) navigate("/signin"); };

  return (
    <div style={{ position: "relative", minHeight: "100vh", overflowX: "hidden", background: colors.lightGray, paddingTop: "80px" }}>
      <Background />

      {/* Navigation Bar */}
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "60px",
          background: colors.primary,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 20px",
          color: colors.white,
          zIndex: 100,
        }}
      >
        <div style={{ fontWeight: "bold", fontSize: "22px" }}>Austrosoft</div>
        <div style={{ display: "flex", gap: "15px", margin: "0 auto" }}>
          {["Home", "Timetable", "Staff", "Subject", "Leave Request"].map((page) => (
            <button
              key={page}
              onClick={() => navigate(`/${page.toLowerCase().replace(" ", "")}`)}
              style={{
                padding: "8px 18px",
                borderRadius: "10px",
                fontWeight: "bold",
                border: "none",
                background: location.pathname === `/${page.toLowerCase().replace(" ", "")}` ? colors.white : "transparent",
                color: location.pathname === `/${page.toLowerCase().replace(" ", "")}` ? colors.primary : colors.white,
                cursor: "pointer",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#334155")}
              onMouseLeave={(e) =>
                (e.currentTarget.style.background =
                  location.pathname === `/${page.toLowerCase().replace(" ", "")}` ? colors.white : "transparent")
              }
            >
              {page}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
          <div style={{ position: "relative" }}>
            <button
              onClick={toggleNotifications}
              style={{
                padding: "8px 16px",
                borderRadius: "10px",
                border: "none",
                cursor: "pointer",
                backgroundColor: colors.blueBtn,
                color: colors.white,
                fontWeight: "bold",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#1e40af")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = colors.blueBtn)}
            >
              Notifications
            </button>

            {showNotifications && (
              <div
                style={{
                  position: "absolute",
                  top: "45px",
                  right: 0,
                  width: "300px",
                  backgroundColor: "#f0f8ff",
                  borderRadius: "10px",
                  boxShadow: "0 8px 20px rgba(0,0,0,0.25)",
                  padding: "15px",
                  zIndex: 200,
                }}
              >
                <ul style={{ paddingLeft: "20px", margin: 0 }}>
                  {messages.map((msg, i) => (
                    <li
                      key={i}
                      style={{
                        marginBottom: "10px",
                        background: "#e2e8f0",
                        padding: "10px",
                        borderRadius: "8px",
                        position: "relative",
                      }}
                    >
                      {msg}
                      <button
                        onClick={() => closeMessage(i)}
                        style={{
                          position: "absolute",
                          top: "5px",
                          right: "5px",
                          border: "none",
                          background: "transparent",
                          color: colors.red,
                          fontWeight: "bold",
                          cursor: "pointer",
                        }}
                      >
                        ✕
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <button
            onClick={handleLogout}
            style={{
              padding: "8px 16px",
              borderRadius: "10px",
              border: "none",
              cursor: "pointer",
              backgroundColor: colors.red,
              color: colors.white,
              fontWeight: "bold",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#b71c1c")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = colors.red)}
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Page Heading */}
      <motion.h1
        style={{ textAlign: "center", fontSize: "46px", color: colors.primary, marginBottom: "50px", fontFamily: "'Georgia', serif" }}
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
      >
        Meet Our Staff
        <motion.div
          style={{ height: "4px", width: "0%", background: colors.blueBtn, margin: "10px auto", borderRadius: "2px" }}
          animate={{ width: "80%" }}
          transition={{ duration: 1.5 }}
        />
      </motion.h1>

      <div style={{ position: "relative", zIndex: 1 }}>
        <StaffSection title="Principal" staffList={staffData.principal} role="principal" onClick={setSelectedStaff} />
        <StaffSection title="Vice Principal" staffList={staffData.vicePrincipal} role="vicePrincipal" onClick={setSelectedStaff} />
        <StaffSection title="Teachers" staffList={staffData.teachers} role="teachers" onClick={setSelectedStaff} />
        <StaffSection title="Training Staff" staffList={staffData.trainingStaff} role="trainingStaff" onClick={setSelectedStaff} />
      </div>

      {/* Modal */}
      <AnimatePresence>
        {selectedStaff && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              background: "rgba(0,0,0,0.5)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 200,
            }}
            onClick={() => setSelectedStaff(null)}
          >
            <motion.div
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.5 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: "#fff",
                padding: "30px",
                borderRadius: "20px",
                maxWidth: "500px",
                width: "90%",
                boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
                textAlign: "center",
                overflowY: "auto",
                maxHeight: "80vh",
              }}
            >
              <h2 style={{ marginBottom: "15px" }}>
                {selectedStaff.title} {selectedStaff.name}
              </h2>
              <p><strong>Staff ID:</strong> {selectedStaff.id}</p>
              <p><strong>Degree:</strong> {selectedStaff.degree}</p>
              <p><strong>Study:</strong> {selectedStaff.study}</p>
              <p><strong>Phone:</strong> {selectedStaff.phone}</p>
              <p><strong>Work Summary:</strong> {selectedStaff.workSummary}</p>
              <p><strong>Experience:</strong> {selectedStaff.experience}</p>
              <p><strong>Projects:</strong> {selectedStaff.projects}</p>
              <button
                onClick={() => setSelectedStaff(null)}
                style={{
                  marginTop: "20px",
                  padding: "10px 20px",
                  borderRadius: "8px",
                  border: "none",
                  background: colors.blueBtn,
                  color: "#fff",
                  fontWeight: "bold",
                  cursor: "pointer",
                }}
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
