import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function SignIn({ setUserLoggedIn }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    document.body.style.transition = "background 0.5s ease";
    document.body.style.background = "#001A33";
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }
    setError("");
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setUserLoggedIn(true);
      navigate("/home");
    }, 1000);
  };

  return (
    <div style={styles.page}>
      <link
        href="https://fonts.googleapis.com/css2?family=Audiowide&family=Poppins:wght@600&display=swap"
        rel="stylesheet"
      />
      <motion.div
        initial={{ opacity: 0, x: -100 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 100 }}
        transition={{ duration: 0.5 }}
        style={styles.card}
      >
        <div style={styles.titleContainer}>
          <h1 style={styles.logo}>Astrosoft</h1>
          <motion.div
            style={styles.animatedLine}
            animate={{ width: ["0%", "100%", "0%"] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <p style={styles.subtitle}>Welcome Back! Please login to continue.</p>
        </div>

        {error && <p style={styles.error}>{error}</p>}

        <form onSubmit={handleLogin} style={styles.form}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
          />
          <motion.button
            type="submit"
            style={styles.button}
            whileHover={{ backgroundColor: "#ffffff", color: "#001A33" }}
          >
            {loading ? "Loading..." : "Sign In"}
          </motion.button>
        </form>

        <p style={styles.footerText}>
          Don't have an account?{" "}
          <span
            style={styles.signUpLink}
            onClick={() => navigate("/signup")}
          >
            Sign Up
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
    height: "100vh",
    background: "#001A33",
    fontFamily: "'Poppins', sans-serif",
  },
  card: {
    background: "#ffffff",
    padding: "40px",
    borderRadius: "20px",
    width: "400px",
    textAlign: "center",
    boxShadow: "0 8px 30px rgba(0,0,0,0.3)",
  },
  titleContainer: { marginBottom: "30px" },
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
    backgroundColor: "#001A33",
    borderRadius: "2px",
  },
  subtitle: { fontSize: "14px", color: "#001A33", marginTop: "5px" },
  error: { color: "red", fontSize: "14px", margin: "10px 0" },
  form: { display: "flex", flexDirection: "column", gap: "20px", marginTop: "20px" },
  input: { padding: "12px", borderRadius: "10px", border: "2px solid #001A33", outline: "none", fontSize: "16px", transition: "0.3s ease" },
  button: { padding: "12px", borderRadius: "10px", border: "2px solid #001A33", backgroundColor: "#001A33", color: "#ffffff", fontSize: "18px", cursor: "pointer", fontWeight: "bold", transition: "all 0.3s ease" },
  footerText: { marginTop: "20px", fontSize: "14px", color: "#001A33" },
  signUpLink: { color: "#001A33", cursor: "pointer", textDecoration: "underline" },
};
