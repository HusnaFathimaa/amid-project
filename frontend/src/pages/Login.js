import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import logo from "./logo.jpg";

const API = "https://amid-project.onrender.com";

function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`${API}/auth/login`, form);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);
      localStorage.setItem("name", res.data.name);
      localStorage.setItem("user_id", res.data.user_id);
      if (res.data.role === "vendor") navigate("/vendor");
      else if (res.data.role === "admin") navigate("/admin");
      else navigate("/client");
    } catch (err) {
      setMessage(err.response?.data?.detail || "Login failed");
    }
    setLoading(false);
  };

  return (
    <div style={s.page}>
      <div style={s.left}>
        <div style={s.leftOverlay}>
          <img src={logo} alt="AmId" style={s.leftLogo} />
          <p style={s.leftTagline}>Own The Look</p>
          <p style={s.leftSub}>India's premier dress rental marketplace — where luxury meets accessibility.</p>
          <div style={s.features}>
            {["✦  Curated designer collection", "✦  AI-powered style guidance", "✦  Seamless rental experience"].map((f, i) => (
              <p key={i} style={s.feature}>{f}</p>
            ))}
          </div>
        </div>
      </div>

      <div style={s.right}>
        <div style={s.formBox}>
          <img src={logo} alt="AmId" style={s.formLogo} />
          <h2 style={s.title}>Welcome Back</h2>
          <p style={s.subtitle}>Sign in to your AmId account</p>

          <label style={s.label}>Email Address</label>
          <input style={s.input} name="email" placeholder="Enter your email"
            onChange={handleChange}
            onFocus={e => e.target.style.borderColor = "#C9A84C"}
            onBlur={e => e.target.style.borderColor = "#2A2A2A"} />

          <label style={s.label}>Password</label>
          <input style={s.input} name="password" placeholder="Enter your password"
            type="password" onChange={handleChange}
            onFocus={e => e.target.style.borderColor = "#C9A84C"}
            onBlur={e => e.target.style.borderColor = "#2A2A2A"} />

          {message && <div style={s.errorMsg}>{message}</div>}

          <button style={s.btn} onClick={handleSubmit}
            onMouseEnter={e => { e.target.style.background = "#B8922E"; e.target.style.transform = "translateY(-1px)"; }}
            onMouseLeave={e => { e.target.style.background = "#C9A84C"; e.target.style.transform = "translateY(0)"; }}>
            {loading ? "Signing In..." : "Sign In"}
          </button>

          <div style={s.divider}><span style={s.dividerText}>or</span></div>

          <p style={s.switchText}>
            New to AmId?{" "}
            <span style={s.link} onClick={() => navigate("/signup")}>Create Account</span>
          </p>
          <p style={{ ...s.switchText, marginTop: "10px" }}>
            <span style={s.link} onClick={() => navigate("/reset-password")}>Forgot Password?</span>
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
    padding: "60px 40px", position: "relative", overflow: "hidden"
  },
  leftOverlay: { textAlign: "center", zIndex: 1, position: "relative" },
  leftLogo: {
    width: "200px", height: "200px", objectFit: "contain", marginBottom: "24px",
    filter: "drop-shadow(0 8px 24px rgba(201,168,76,0.4))"
  },
  leftTagline: {
    fontSize: "28px", letterSpacing: "8px", color: "#C9A84C",
    textTransform: "uppercase", margin: "0 0 16px", fontWeight: "300"
  },
  leftSub: {
    fontSize: "15px", color: "#888", lineHeight: "1.8",
    maxWidth: "300px", margin: "0 auto 28px"
  },
  features: { marginTop: "8px" },
  feature: { fontSize: "13px", color: "#C9A84C", letterSpacing: "1px", margin: "8px 0", opacity: 0.8 },
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
    textTransform: "uppercase", fontWeight: "700", marginTop: "4px",
    transition: "all 0.2s", fontFamily: "'Arial', sans-serif"
  },
  errorMsg: {
    background: "#FFF3F3", border: "1px solid #E57373", color: "#C62828",
    padding: "12px 16px", borderRadius: "4px", fontSize: "13px",
    marginBottom: "16px", fontFamily: "'Arial', sans-serif"
  },
  divider: {
    textAlign: "center", margin: "20px 0", position: "relative", borderTop: "1px solid #DDD"
  },
  dividerText: {
    background: "#FAF8F4", padding: "0 12px", color: "#AAA",
    fontSize: "12px", position: "relative", top: "-10px",
    fontFamily: "'Arial', sans-serif"
  },
  switchText: { textAlign: "center", fontSize: "13px", color: "#888", fontFamily: "'Arial', sans-serif" },
  link: { color: "#C9A84C", cursor: "pointer", fontWeight: "600", borderBottom: "1px solid #C9A84C" }
};

export default Login;