import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "client" });
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      const res = await axios.post("http://localhost:8000/auth/signup", form);
      setMessage("Account created! Redirecting to login...");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setMessage(err.response?.data?.detail || "Something went wrong");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>AmId</h1>
        <p style={styles.subtitle}>Create your account</p>

        <input style={styles.input} name="name" placeholder="Full Name"
          onChange={handleChange} />
        <input style={styles.input} name="email" placeholder="Email"
          onChange={handleChange} />
        <input style={styles.input} name="password" placeholder="Password"
          type="password" onChange={handleChange} />

        <select style={styles.input} name="role" onChange={handleChange}>
          <option value="client">I am a Client (renting a dress)</option>
          <option value="vendor">I am a Vendor (listing dresses)</option>
        </select>

        <button style={styles.button} onClick={handleSubmit}>Create Account</button>
        {message && <p style={styles.message}>{message}</p>}
        <p style={styles.link} onClick={() => navigate("/login")}>
          Already have an account? Login
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

export default Signup;