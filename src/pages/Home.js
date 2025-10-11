// src/pages/Home.js
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FaArrowLeft,
  FaArrowRight,
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

import schoolImage1 from "../school image.jpg";
import school2 from "../school2.jpg";
import school5 from "../school5.webp";
import school6 from "../school6.webp";
import schoolImage2 from "../school image.jpg";

export default function Home() {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentImage, setCurrentImage] = useState(0);
  const [showCalendar, setShowCalendar] = useState(true);
  const [showAnnouncements, setShowAnnouncements] = useState(true);

  const colors = {
    primary: "#0f172a",
    panelBlue: "#1e40af",
    panelHeaderText: "#fff",
    panelBody: "#fff",
    blueBtn: "#3b82f6",
    red: "#dc3545",
    green: "#16a34a",
    orange: "#f97316",
    lightGray: "#f8fafc",
    white: "#fff",
    footerDark: "#1e293b",
    footerText: "#cbd5e1",
    boxText: "#fff",
    welcomeBox: "#1e40af",
  };

  const images = [schoolImage1, school2, school5, school6, schoolImage2];

  const nextImage = () => setCurrentImage((prev) => (prev + 1) % images.length);
  const prevImage = () =>
    setCurrentImage((prev) => (prev - 1 + images.length) % images.length);

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) navigate("/signin");
  };

  const staffDetails = [
    { msg: "Mr. Arish - Principal", page: "/staff" },
    { msg: "Ms. Jane - Math Teacher", page: "/staff" },
    { msg: "Mr. John - Science Teacher", page: "/staff" },
    { msg: "Ms. Lily - English Teacher", page: "/staff" },
  ];

  const subjectDetails = [
    { msg: "Mathematics - Algebra & Geometry", page: "/subject" },
    { msg: "Science - Physics & Chemistry", page: "/subject" },
    { msg: "English - Grammar & Literature", page: "/subject" },
    { msg: "History - World History", page: "/subject" },
  ];

  const leaveDetails = [
    { msg: "John Doe - Annual Leave - Approved", page: "/leave-request" },
    { msg: "Jane Smith - Medical Leave - Pending", page: "/leave-request" },
    { msg: "Mark Lee - Short Leave - Approved", page: "/leave-request" },
    { msg: "Lucy Brown - Casual Leave - Pending", page: "/leave-request" },
  ];

  const announcements = [
    { msg: "School reopens on 15th September.", time: "12:00 PM" },
    { msg: "New library books have arrived.", time: "01:00 PM" },
    { msg: "Science fair scheduled for next week.", time: "02:30 PM" },
    { msg: "Parent-teacher meeting on Friday.", time: "03:00 PM" },
  ];

  const RollingBox = ({ title, items, bgColor }) => {
    const [index, setIndex] = useState(0);
    useEffect(() => {
      const interval = setInterval(
        () => setIndex((prev) => (prev + 1) % items.length),
        3000
      );
      return () => clearInterval(interval);
    }, [items.length]);

    return (
      <motion.div
        onClick={() => navigate(items[index].page)}
        whileHover={{ scale: 1.03, boxShadow: "0 10px 20px rgba(0,0,0,0.2)" }}
        style={{
          background: bgColor,
          borderRadius: "15px",
          padding: "20px 25px",
          minHeight: "140px",
          color: colors.boxText,
          position: "relative",
          overflow: "hidden",
          cursor: "pointer",
        }}
      >
        <h3 style={{ fontWeight: "bold", marginBottom: "15px" }}>{title}</h3>
        <AnimatePresence>
          <motion.div
            key={index}
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            transition={{ duration: 0.5 }}
            style={{ position: "relative", top: "0" }}
          >
            <p style={{ margin: "0", fontSize: "0.95rem" }}>
              {items[index].msg}
            </p>
          </motion.div>
        </AnimatePresence>
      </motion.div>
    );
  };

  // Calendar generation
  const getCalendar = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const weeks = [];
    let week = new Array(7).fill(null);
    let dayCounter = 1;

    for (let i = firstDay; i < 7; i++) week[i] = dayCounter++;
    weeks.push([...week]);

    while (dayCounter <= daysInMonth) {
      week = new Array(7).fill(null);
      for (let i = 0; i < 7 && dayCounter <= daysInMonth; i++)
        week[i] = dayCounter++;
      weeks.push([...week]);
    }

    return { weeks, today, month, year };
  };

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        fontFamily: "Inter, Arial, sans-serif",
        background: colors.lightGray,
        paddingTop: "80px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      {/* Navbar */}
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
          color: "#fff",
          zIndex: 100,
        }}
      >
        <div
          style={{
            fontWeight: "bold",
            fontSize: "1.5rem",
            cursor: "pointer",
          }}
          onClick={() => navigate("/home")}
        >
          AstroSoft
        </div>
        <div style={{ display: "flex", gap: "15px" }}>
          {["Home", "Staff", "Subject", "Timetable", "Leave Request"].map(
            (page) => (
              <button
                key={page}
                onClick={() =>
                  navigate(`/${page.toLowerCase().replace(" ", "-")}`)
                }
                style={{
                  padding: "6px 12px",
                  borderRadius: "8px",
                  fontWeight: "bold",
                  border: "none",
                  background:
                    location.pathname ===
                    `/${page.toLowerCase().replace(" ", "-")}`
                      ? colors.white
                      : "transparent",
                  color:
                    location.pathname ===
                    `/${page.toLowerCase().replace(" ", "-")}`
                      ? colors.primary
                      : "#fff",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                }}
              >
                {page}
              </button>
            )
          )}
        </div>
        <button
          onClick={handleLogout}
          style={{
            padding: "6px 12px",
            borderRadius: "8px",
            border: "none",
            cursor: "pointer",
            backgroundColor: colors.red,
            color: "#fff",
            fontWeight: "bold",
          }}
        >
          Logout
        </button>
      </nav>

      {/* Welcome Box */}
      <section
        style={{
          width: "90%",
          maxWidth: "1200px",
          marginBottom: "30px",
          textAlign: "center",
          background: colors.welcomeBox,
          padding: "40px 25px",
          borderRadius: "15px",
          position: "relative",
          overflow: "hidden",
          color: "#fff",
        }}
      >
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          style={{
            fontSize: "2.8rem",
            fontWeight: "bold",
            marginBottom: "20px",
          }}
        >
          Welcome Home
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 1 }}
          style={{
            fontSize: "1.1rem",
            maxWidth: "650px",
            margin: "0 auto",
            lineHeight: "1.5",
            fontStyle: "italic",
          }}
        >
          Manage your school staff, subjects, and leave requests effortlessly
          with AstroSoft.
        </motion.p>
        {/* Animated Line */}
        <motion.div
          style={{
            position: "absolute",
            bottom: "10px",
            left: "0",
            height: "4px",
            width: "100%",
            borderRadius: "4px",
            overflow: "hidden",
          }}
        >
          <motion.div
            style={{
              height: "100%",
              width: "0%",
              background:
                "linear-gradient(90deg,#3b82f6,#06b6d4,#3b82f6)",
              borderRadius: "4px",
            }}
            animate={{ width: ["0%", "100%", "0%"] }}
            transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
          />
        </motion.div>
      </section>

      {/* Photo Carousel */}
      <div
        style={{
          width: "90%",
          maxWidth: "800px",
          marginBottom: "30px",
          position: "relative",
        }}
      >
        <img
          src={images[currentImage]}
          alt="School"
          style={{
            width: "100%",
            height: "400px",
            objectFit: "cover",
            borderRadius: "15px",
          }}
        />
        <button
          onClick={prevImage}
          style={{
            position: "absolute",
            top: "50%",
            left: "10px",
            transform: "translateY(-50%)",
            background: "#00000088",
            color: "#fff",
            border: "none",
            borderRadius: "50%",
            padding: "10px",
            cursor: "pointer",
          }}
        >
          <FaArrowLeft />
        </button>
        <button
          onClick={nextImage}
          style={{
            position: "absolute",
            top: "50%",
            right: "10px",
            transform: "translateY(-50%)",
            background: "#00000088",
            color: "#fff",
            border: "none",
            borderRadius: "50%",
            padding: "10px",
            cursor: "pointer",
          }}
        >
          <FaArrowRight />
        </button>
      </div>

      {/* Rolling Boxes */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px,1fr))",
          gap: "20px",
          width: "90%",
          maxWidth: "1200px",
          marginBottom: "30px",
        }}
      >
        <RollingBox title="Staff Details" items={staffDetails} bgColor={colors.green} />
        <RollingBox title="Subjects" items={subjectDetails} bgColor={colors.orange} />
        <RollingBox title="Leave Requests" items={leaveDetails} bgColor={colors.red} />
      </div>

      {/* Calendar Panel */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{
          width: "90%",
          maxWidth: "1200px",
          marginBottom: "20px",
          borderRadius: "12px",
          overflow: "hidden",
          boxShadow: "0 5px 15px rgba(0,0,0,0.2)",
        }}
      >
        <div
          style={{
            background: colors.panelBlue,
            padding: "15px 20px",
            cursor: "pointer",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            color: colors.panelHeaderText,
          }}
          onClick={() => setShowCalendar(!showCalendar)}
        >
          <h3 style={{ margin: 0 }}>📅 Calendar</h3>
          <span>{showCalendar ? "-" : "+"}</span>
        </div>
        <AnimatePresence>
          {showCalendar && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              style={{ background: colors.panelBody, padding: "20px", color: "#000" }}
            >
              {(() => {
                const { weeks, today, month, year } = getCalendar();
                return (
                  <div>
                    <h4 style={{ textAlign: "center" }}>
                      {monthNames[month]} {year}
                    </h4>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(7,1fr)",
                        gap: "5px",
                        marginTop: "10px",
                      }}
                    >
                      {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                        (d, i) => (
                          <div
                            key={i}
                            style={{ fontWeight: "bold", textAlign: "center" }}
                          >
                            {d}
                          </div>
                        )
                      )}
                      {weeks.flat().map((day, idx) => {
                        const isToday =
                          day === today.getDate() &&
                          month === today.getMonth() &&
                          year === today.getFullYear();
                        return (
                          <div
                            key={idx}
                            style={{
                              padding: "10px",
                              background: isToday ? "#3b82f6" : "#e5e7eb",
                              borderRadius: "6px",
                              textAlign: "center",
                              color: isToday ? "#fff" : "#000",
                            }}
                          >
                            {day || ""}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.section>

      {/* Announcements Panel */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{
          width: "90%",
          maxWidth: "1200px",
          marginBottom: "50px",
          borderRadius: "12px",
          overflow: "hidden",
          boxShadow: "0 5px 15px rgba(0,0,0,0.2)",
        }}
      >
        <div
          style={{
            background: colors.panelBlue,
            padding: "15px 20px",
            cursor: "pointer",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            color: colors.panelHeaderText,
          }}
          onClick={() => setShowAnnouncements(!showAnnouncements)}
        >
          <h3 style={{ margin: 0 }}>📢 Announcements</h3>
          <span>{showAnnouncements ? "-" : "+"}</span>
        </div>
        <AnimatePresence>
          {showAnnouncements && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              style={{ background: colors.panelBody, padding: "20px", color: "#000" }}
            >
              {announcements.map((item, idx) => (
                <motion.p
                  key={idx}
                  initial={{ x: 300, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: idx * 0.1, duration: 0.5 }}
                  style={{ margin: "8px 0" }}
                >
                  {item.msg}{" "}
                  <span style={{ fontSize: "0.8rem", color: "#555" }}>
                    ({item.time})
                  </span>
                </motion.p>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.section>

      {/* Footer */}
      <footer
        style={{
          background: "linear-gradient(90deg,#1e293b,#111827)",
          color: colors.footerText,
          padding: "50px 20px",
          width: "100%",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            flexWrap: "wrap",
            maxWidth: "1200px",
            margin: "0 auto",
          }}
        >
          <div style={{ flex: "1 1 250px", marginBottom: "20px" }}>
            <h3 style={{ color: "#fff", marginBottom: "15px" }}>
              School Management System
            </h3>
            <p style={{ fontSize: "14px" }}>
              Efficiently manage staff, subjects, timetables, and leave requests
              with our modern platform.
            </p>
          </div>
          <div style={{ flex: "1 1 250px", marginBottom: "20px" }}>
            <h4 style={{ color: "#fff", marginBottom: "15px" }}>Quick Links</h4>
            <ul style={{ listStyle: "none", padding: 0 }}>
              {["Home", "Staff", "Subjects", "Leave Request"].map((link, idx) => (
                <li key={idx} style={{ marginBottom: "8px" }}>
                  <button
                    onClick={() => navigate(`/${link.toLowerCase().replace(" ", "-")}`)}
                    style={{
                      background: "none",
                      border: "none",
                      color: colors.footerText,
                      cursor: "pointer",
                      fontSize: "14px",
                    }}
                  >
                    {link}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div style={{ flex: "1 1 250px", marginBottom: "20px" }}>
            <h4 style={{ color: "#fff", marginBottom: "15px" }}>Contact Us</h4>
            <p>
              <FaMapMarkerAlt /> No.123 Main Street, Colombo
            </p>
            <p>
              <FaPhone /> +94 71 234 5678
            </p>
            <p>
              <FaEnvelope /> info@astrosoft.com
            </p>
          </div>
          <div style={{ flex: "1 1 250px", textAlign: "center" }}>
            <h4 style={{ color: "#fff", marginBottom: "15px" }}>Follow Us</h4>
            <div style={{ display: "flex", justifyContent: "center", gap: "15px" }}>
              <FaFacebookF style={{ cursor: "pointer" }} />
              <FaTwitter style={{ cursor: "pointer" }} />
              <FaInstagram style={{ cursor: "pointer" }} />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
