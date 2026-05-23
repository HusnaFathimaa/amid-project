import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      const res = await axios.post("http://localhost:8000/auth/login", form);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);
      localStorage.setItem("name", res.data.name);
      localStorage.setItem("user_id", res.data.user_id);

      if (res.data.role === "vendor") navigate("/vendor");
      else navigate("/client");
    } catch (err) {
      setMessage(err.response?.data?.detail || "Login failed");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>AmId</h1>
        <p style={styles.subtitle}>Welcome back</p>

        <input style={styles.input} name="email" placeholder="Email"
          onChange={handleChange} />
        <input style={styles.input} name="password" placeholder="Password"
          type="password" onChange={handleChange} />

        <button style={styles.button} onClick={handleSubmit}>Login</button>
        {message && <p style={styles.message}>{message}</p>}
        <p style={styles.link} onClick={() => navigate("/signup")}>
          Don't have an account? Sign up
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: "100vh", background: "#f8f4f0", display: "flex", alignItems: "center", justifyContent: "center" },
  card: { background: "white", padding: "40px", borderRadius: "16px", width: "380px", boxShadow: "0 4px 24px rgba(0,0,0,0.08)" },
  title: { textAlign: "center", fontSize: "32px", color: "#c0392b", margin: "0 0 4px" },
  subtitle: { textAlign: "center", color: "#888", marginBottom: "24px" },
  input: { width: "100%", padding: "12px", marginBottom: "12px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "14px", boxSizing: "border-box" },
  button: { width: "100%", padding: "14px", background: "#c0392b", color: "white", border: "none", borderRadius: "8px", fontSize: "16px", cursor: "pointer" },
  message: { textAlign: "center", marginTop: "12px", color: "#c0392b" },
  link: { textAlign: "center", marginTop: "16px", color: "#888", cursor: "pointer", fontSize: "13px" }
};

export default Login;