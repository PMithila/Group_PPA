import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function SignUp({ setUserLoggedIn }) {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [staffId, setStaffId] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    document.body.style.transition = "background 0.5s ease";
    document.body.style.background = "#001A33";
  }, []);

  const handleSignUp = (e) => {
    e.preventDefault();

    // Validations
    if (!name || !staffId || !email || !phone || !password || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }
    if (!/^[a-zA-Z\s]+$/.test(name)) {
      setError("Name cannot contain numbers or special characters");
      return;
    }
    if (!/^[a-zA-Z0-9]+$/.test(staffId)) {
      setError("Staff ID cannot contain special characters");
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError("Invalid email address");
      return;
    }
    if (!/^\d{10}$/.test(phone)) {
      setError("Phone number must be 10 digits");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setError("");
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setUserLoggedIn(true);
      navigate("/home");
    }, 1000); // 1-second loading
  };

  return (
    <div style={styles.page}>
      <link
        href="https://fonts.googleapis.com/css2?family=Audiowide&family=Poppins:wght@600&display=swap"
        rel="stylesheet"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        style={styles.card}
      >
        {/* Logo and Animated Line */}
        <div style={styles.titleContainer}>
          <h1 style={styles.logo}>Astrosoft</h1>
          <motion.div
            style={styles.animatedLine}
            animate={{ width: ["0%", "100%", "0%"] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <p style={styles.subtitle}>Create your account below.</p>
        </div>

        {/* Error Message */}
        {error && <p style={styles.error}>{error}</p>}

        {/* Sign Up Form */}
        <form onSubmit={handleSignUp} style={styles.form}>
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={styles.input}
          />
          <input
            type="text"
            placeholder="Staff ID"
            value={staffId}
            onChange={(e) => setStaffId(e.target.value)}
            style={styles.input}
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
          />
          <input
            type="text"
            placeholder="Phone Number"
            value={phone}
            onChange={(e) => {
              const value = e.target.value;
              if (/^\d{0,10}$/.test(value)) {
                setPhone(value);
              }
            }}
            style={styles.input}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
          />
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            style={styles.input}
          />
          <motion.button
            type="submit"
            style={styles.button}
            whileHover={{ backgroundColor: "#ffffff", color: "#001A33" }}
          >
            {loading ? "Loading..." : "Sign Up"}
          </motion.button>
        </form>

        {/* Sign In Link */}
        <p style={styles.footerText}>
          Already have an account?{" "}
          <span style={styles.signInLink} onClick={() => navigate("/signin")}>
            Sign In
          </span>
        </p>
      </motion.div>
    </div>
  );
}

const styles = {
  page: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    background: "#001A33",
    fontFamily: "'Poppins', sans-serif",
  },
  card: {
    background: "#ffffff",
    padding: "50px",
    borderRadius: "20px",
    width: "420px",
    textAlign: "center",
    boxShadow: "0 8px 30px rgba(0,0,0,0.3)",
  },
  titleContainer: {
    marginBottom: "30px",
  },
  logo: {
    fontFamily: "'Audiowide', cursive",
    fontSize: "48px",
    color: "#001A33",
    margin: "0",
  },
  animatedLine: {
    height: "4px",
    width: "0%",
    margin: "10px auto",
    backgroundColor: "#001A33", // Dark blue line
    borderRadius: "2px",
  },
  subtitle: {
    fontSize: "14px",
    color: "#001A33",
    marginTop: "5px",
  },
  error: {
    color: "red",
    fontSize: "14px",
    margin: "10px 0",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
    marginTop: "20px",
  },
  input: {
    padding: "12px",
    borderRadius: "10px",
    border: "2px solid #001A33",
    outline: "none",
    fontSize: "16px",
    transition: "0.3s ease",
  },
  button: {
    padding: "12px",
    borderRadius: "10px",
    border: "2px solid #001A33",
    backgroundColor: "#001A33",
    color: "#ffffff",
    fontSize: "18px",
    cursor: "pointer",
    fontWeight: "bold",
    transition: "all 0.3s ease",
  },
  footerText: {
    marginTop: "20px",
    fontSize: "14px",
    color: "#001A33",
  },
  signInLink: {
    color: "#001A33",
    cursor: "pointer",
    textDecoration: "underline",
  },
};
