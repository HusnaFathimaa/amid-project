import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import logo from "./logo.jpg";

const API = "https://amid-project.onrender.com";

function ResetPassword() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", new_password: "", confirm: "" });
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    if (form.new_password !== form.confirm) {
      setMessage("Passwords do not match");
      return;
    }
    if (form.new_password.length < 6) {
      setMessage("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      await axios.post(`${API}/auth/reset-password`, {
        email: form.email,
        new_password: form.new_password
      });
      setSuccess(true);
      setMessage("Password reset successfully!");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setMessage(err.response?.data?.detail || "Something went wrong");
    }
    setLoading(false);
  };

  return (
    <div style={s.page}>
      <div style={s.left}>
        <div style={s.leftOverlay}>
          <img src={logo} alt="AmId" style={s.leftLogo} />
          <p style={s.leftTagline}>Own The Look</p>
          <p style={s.leftSub}>Reset your password to regain access to your AmId account.</p>
        </div>
      </div>

      <div style={s.right}>
        <div style={s.formBox}>
          <img src={logo} alt="AmId" style={s.formLogo} />
          <h2 style={s.title}>Reset Password</h2>
          <p style={s.subtitle}>Enter your email and choose a new password</p>

          <label style={s.label}>Email Address</label>
          <input style={s.input} name="email" placeholder="Enter your registered email"
            onChange={handleChange}
            onFocus={e => e.target.style.borderColor = "#C9A84C"}
            onBlur={e => e.target.style.borderColor = "#2A2A2A"} />

          <label style={s.label}>New Password</label>
          <input style={s.input} name="new_password" placeholder="Enter new password"
            type="password" onChange={handleChange}
            onFocus={e => e.target.style.borderColor = "#C9A84C"}
            onBlur={e => e.target.style.borderColor = "#2A2A2A"} />

          <label style={s.label}>Confirm New Password</label>
          <input style={s.input} name="confirm" placeholder="Confirm new password"
            type="password" onChange={handleChange}
            onFocus={e => e.target.style.borderColor = "#C9A84C"}
            onBlur={e => e.target.style.borderColor = "#2A2A2A"} />

          {message && (
            <div style={success ? s.successMsg : s.errorMsg}>{message}</div>
          )}

          <button style={s.btn} onClick={handleSubmit}
            onMouseEnter={e => { e.target.style.background = "#B8922E"; e.target.style.transform = "translateY(-1px)"; }}
            onMouseLeave={e => { e.target.style.background = "#C9A84C"; e.target.style.transform = "translateY(0)"; }}>
            {loading ? "Resetting..." : "Reset Password"}
          </button>

          <p style={{ ...s.switchText, marginTop: "20px" }}>
            Remember your password?{" "}
            <span style={s.link} onClick={() => navigate("/login")}>Sign In</span>
          </p>
        </div>
      </div>
    </div>
  );
}

const s = {
  page: { display: "flex", minHeight: "100vh", fontFamily: "'Georgia', serif" },
  left: {
    flex: 1,
    background: "linear-gradient(135deg, #0D0D0D 0%, #1A1A1A 50%, #0D0D0D 100%)",
    display: "flex", alignItems: "center", justifyContent: "center",
    padding: "60px 40px"
  },
  leftOverlay: { textAlign: "center" },
  leftLogo: {
    width: "200px", height: "200px", objectFit: "contain", marginBottom: "24px",
    filter: "drop-shadow(0 8px 24px rgba(201,168,76,0.4))"
  },
  leftTagline: {
    fontSize: "28px", letterSpacing: "8px", color: "#C9A84C",
    textTransform: "uppercase", margin: "0 0 16px", fontWeight: "300"
  },
  leftSub: {
    fontSize: "15px", color: "#888", lineHeight: "1.8", maxWidth: "300px", margin: "0 auto"
  },
  right: {
    flex: 1, background: "#FAF8F4",
    display: "flex", alignItems: "center", justifyContent: "center", padding: "40px"
  },
  formBox: { width: "100%", maxWidth: "420px" },
  formLogo: { width: "70px", height: "70px", objectFit: "contain", marginBottom: "20px", display: "block" },
  title: { fontSize: "28px", color: "#0D0D0D", margin: "0 0 6px", fontWeight: "600", letterSpacing: "1px" },
  subtitle: { fontSize: "14px", color: "#888", margin: "0 0 28px" },
  label: {
    display: "block", fontSize: "12px", color: "#555", marginBottom: "6px",
    fontWeight: "600", letterSpacing: "1.5px", textTransform: "uppercase",
    fontFamily: "'Arial', sans-serif"
  },
  input: {
    width: "100%", padding: "14px 16px", marginBottom: "18px",
    borderRadius: "4px", border: "1px solid #2A2A2A",
    background: "#FFFFFF", fontSize: "14px", boxSizing: "border-box",
    color: "#0D0D0D", outline: "none", transition: "border-color 0.2s",
    fontFamily: "'Arial', sans-serif"
  },
  btn: {
    width: "100%", padding: "16px", background: "#C9A84C",
    color: "#0D0D0D", border: "none", borderRadius: "4px",
    fontSize: "13px", cursor: "pointer", letterSpacing: "2px",
    textTransform: "uppercase", fontWeight: "700",
    transition: "all 0.2s", fontFamily: "'Arial', sans-serif"
  },
  successMsg: {
    background: "#F0F9F0", border: "1px solid #4CAF50", color: "#2E7D32",
    padding: "12px 16px", borderRadius: "4px", fontSize: "13px",
    marginBottom: "16px", fontFamily: "'Arial', sans-serif"
  },
  errorMsg: {
    background: "#FFF3F3", border: "1px solid #E57373", color: "#C62828",
    padding: "12px 16px", borderRadius: "4px", fontSize: "13px",
    marginBottom: "16px", fontFamily: "'Arial', sans-serif"
  },
  switchText: { textAlign: "center", fontSize: "13px", color: "#888", fontFamily: "'Arial', sans-serif" },
  link: { color: "#C9A84C", cursor: "pointer", fontWeight: "600", borderBottom: "1px solid #C9A84C" }
};

export default ResetPassword;