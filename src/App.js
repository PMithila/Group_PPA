import React, { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Home from "./pages/Home";
import Timetable from "./pages/Timetable";
import SubjectDetails from "./pages/SubjectDetails";
import StaffDetails from "./pages/StaffDetails";

export default function App() {
  const [userLoggedIn, setUserLoggedIn] = useState(false);

  return (
    <Routes>
      <Route path="/signin" element={<SignIn setUserLoggedIn={setUserLoggedIn} />} />
      <Route path="/signup" element={<SignUp setUserLoggedIn={setUserLoggedIn} />} />
      <Route path="/home" element={userLoggedIn ? <Home /> : <Navigate to="/signin" />} />
      <Route path="/timetable" element={userLoggedIn ? <Timetable /> : <Navigate to="/signin" />} />
      <Route path="/subject" element={userLoggedIn ? <SubjectDetails /> : <Navigate to="/signin" />} />
      <Route path="/staff" element={userLoggedIn ? <StaffDetails /> : <Navigate to="/signin" />} />
      <Route path="*" element={<Navigate to="/signin" />} />
    </Routes>
  );
}
