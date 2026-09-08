import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import logo from "./logo.jpg";

function VendorDashboard() {
  const navigate = useNavigate();
  const name = localStorage.getItem("name");
  const vendor_id = localStorage.getItem("user_id");

  const [form, setForm] = useState({
    name: "", description: "", price_per_day: "",
    delivery_days: "", image_url: "", vendor_id: vendor_id
  });
  const [myDresses, setMyDresses] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState("upload");

  useEffect(() => {
    fetchMyDresses();
    fetchBookings();
    // eslint-disable-next-line
  }, []);

  const fetchMyDresses = async () => {
    try {
      const res = await axios.get(`https://amid-project.onrender.com/dresses/vendor/${vendor_id}`);
      setMyDresses(res.data);
    } catch (err) { console.log(err); }
  };

  const fetchBookings = async () => {
    try {
      const res = await axios.get(`https://amid-project.onrender.com/bookings/vendor/${vendor_id}`);
      setBookings(res.data);
    } catch (err) { console.log(err); }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleUpload = async () => {
    try {
      await axios.post("https://amid-project.onrender.com/dresses/upload", {
        ...form,
        price_per_day: parseFloat(form.price_per_day),
        delivery_days: parseInt(form.delivery_days),
        vendor_id: parseInt(vendor_id)
      });
      setMessage("Dress uploaded successfully!");
      setForm({ name: "", description: "", price_per_day: "", delivery_days: "", image_url: "", vendor_id: vendor_id });
      fetchMyDresses();
    } catch (err) {
      setMessage("Upload failed. Please fill all fields.");
    }
  };

  const handleApproval = async (booking_id, status) => {
    try {
      await axios.put(`https://amid-project.onrender.com/bookings/update/${booking_id}?status=${status}`);
      fetchBookings();
    } catch (err) { console.log(err); }
  };

  const logout = () => { localStorage.clear(); navigate("/login"); };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.logoRow}>
          <img src={logo} alt="AmId" style={styles.headerLogo} />
          <h2 style={styles.logo}>AmId</h2>
        </div>
        <div style={styles.headerRight}>
          <span style={styles.welcome}>Welcome, {name}</span>
          <button
            style={styles.logoutBtn}
            onClick={logout}
            onMouseEnter={e => { e.target.style.background = "#C9A84C"; e.target.style.color = "#0D0D0D"; }}
            onMouseLeave={e => { e.target.style.background = "transparent"; e.target.style.color = "#C9A84C"; }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={styles.tabBar}>
        <button style={activeTab === "upload" ? styles.tabActive : styles.tab}
          onClick={() => setActiveTab("upload")}>Upload Dress</button>
        <button style={activeTab === "mydresses" ? styles.tabActive : styles.tab}
          onClick={() => setActiveTab("mydresses")}>My Dresses ({myDresses.length})</button>
        <button style={activeTab === "bookings" ? styles.tabActive : styles.tab}
          onClick={() => setActiveTab("bookings")}>Bookings ({bookings.length})</button>
      </div>

      <div style={styles.body}>

        {/* Upload Tab */}
        {activeTab === "upload" && (
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Upload a New Dress</h3>

            <label style={styles.label}>Image URL</label>
            <input style={styles.input} name="image_url" placeholder="Paste image URL here"
              value={form.image_url} onChange={handleChange}
              onFocus={e => e.target.style.borderColor = "#C9A84C"}
              onBlur={e => e.target.style.borderColor = "#2A2A2A"} />

            <label style={styles.label}>Price per Day (₹)</label>
            <input style={styles.input} name="price_per_day" placeholder="e.g. 999"
              type="number" value={form.price_per_day} onChange={handleChange}
              onFocus={e => e.target.style.borderColor = "#C9A84C"}
              onBlur={e => e.target.style.borderColor = "#2A2A2A"} />

            <label style={styles.label}>Delivery Days</label>
            <input style={styles.input} name="delivery_days" placeholder="e.g. 2"
              type="number" value={form.delivery_days} onChange={handleChange}
              onFocus={e => e.target.style.borderColor = "#C9A84C"}
              onBlur={e => e.target.style.borderColor = "#2A2A2A"} />

            <label style={styles.label}>Dress Name</label>
            <input style={styles.input} name="name" placeholder="Dress Name"
              value={form.name} onChange={handleChange}
              onFocus={e => e.target.style.borderColor = "#C9A84C"}
              onBlur={e => e.target.style.borderColor = "#2A2A2A"} />

            <label style={styles.label}>Description</label>
            <textarea style={styles.textarea} name="description" placeholder="Description"
              value={form.description} onChange={handleChange}
              onFocus={e => e.target.style.borderColor = "#C9A84C"}
              onBlur={e => e.target.style.borderColor = "#2A2A2A"} />

            {form.image_url && (
              <img src={form.image_url} alt="preview" style={styles.preview} />
            )}

            <button
              style={styles.button}
              onClick={handleUpload}
              onMouseEnter={e => { e.target.style.background = "#B8922E"; e.target.style.transform = "translateY(-1px)"; }}
              onMouseLeave={e => { e.target.style.background = "#C9A84C"; e.target.style.transform = "translateY(0)"; }}
            >
              Upload Dress
            </button>
            {message && <p style={styles.message}>{message}</p>}
          </div>
        )}

        {/* My Dresses Tab */}
        {activeTab === "mydresses" && (
          <div>
            <h3 style={styles.cardTitle}>My Listed Dresses</h3>
            {myDresses.length === 0 && <p style={styles.empty}>No dresses uploaded yet.</p>}
            <div style={styles.grid}>
              {myDresses.map(dress => (
                <div key={dress.id} style={styles.dressCard}>
                  <img src={dress.image_url} alt={dress.name} style={styles.dressImg} />
                  <div style={styles.dressInfo}>
                    <h4 style={styles.dressName}>{dress.name}</h4>
                    <p style={styles.dressPrice}>₹{dress.price_per_day}/day</p>
                    <p style={styles.dressDelivery}>Delivery in {dress.delivery_days} days</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bookings Tab */}
        {activeTab === "bookings" && (
          <div>
            <h3 style={styles.cardTitle}>Incoming Booking Requests</h3>
            {bookings.length === 0 && <p style={styles.empty}>No bookings yet.</p>}
            {bookings.map(booking => (
              <div key={booking.booking_id} style={styles.bookingCard}>
                <div style={styles.bookingTop}>
                  <div>
                    <h4 style={styles.bookingDress}>{booking.dress_name}</h4>
                    <p style={styles.bookingClient}>{booking.client_name} — {booking.client_email}</p>
                    <p style={styles.bookingDates}>{booking.rental_start} to {booking.rental_end}</p>
                    <p style={styles.bookingAddress}>{booking.delivery_address}</p>
                    <p style={styles.bookingPrice}>₹{booking.total_price}</p>
                  </div>
                  <div>
                    <span style={{
                      ...styles.statusBadge,
                      background: booking.status === "approved" ? "rgba(46,125,50,0.15)" :
                        booking.status === "rejected" ? "rgba(198,40,40,0.15)" : "rgba(201,168,76,0.15)",
                      color: booking.status === "approved" ? "#4CAF50" :
                        booking.status === "rejected" ? "#EF5350" : "#C9A84C"
                    }}>{booking.status.toUpperCase()}</span>
                  </div>
                </div>
                {booking.status === "pending" && (
                  <div style={styles.actionRow}>
                    <button style={styles.approveBtn}
                      onClick={() => handleApproval(booking.booking_id, "approved")}>
                      Approve
                    </button>
                    <button style={styles.rejectBtn}
                      onClick={() => handleApproval(booking.booking_id, "rejected")}>
                      Reject
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: "100vh", background: "#FAF8F4", fontFamily: "'Arial', sans-serif" },
  header: {
    background: "#0D0D0D", padding: "16px 32px", display: "flex",
    justifyContent: "space-between", alignItems: "center",
    boxShadow: "0 2px 12px rgba(0,0,0,0.3)"
  },
  logoRow: { display: "flex", alignItems: "center", gap: "12px" },
  headerLogo: { width: "36px", height: "36px", objectFit: "contain" },
  logo: { color: "#C9A84C", margin: 0, fontSize: "22px", fontFamily: "'Georgia', serif", letterSpacing: "1px" },
  headerRight: { display: "flex", alignItems: "center", gap: "20px" },
  welcome: { fontSize: "13px", color: "#AAA" },
  logoutBtn: {
    padding: "8px 18px", background: "transparent", color: "#C9A84C",
    border: "1px solid #C9A84C", borderRadius: "4px", cursor: "pointer",
    fontSize: "12px", letterSpacing: "1px", textTransform: "uppercase",
    fontWeight: "700", transition: "all 0.2s"
  },
  tabBar: { background: "#161616", padding: "0 32px", display: "flex", gap: "4px", borderBottom: "1px solid #2A2A2A" },
  tab: {
    padding: "16px 20px", background: "none", border: "none", borderBottom: "2px solid transparent",
    cursor: "pointer", color: "#888", fontSize: "13px", letterSpacing: "0.5px",
    textTransform: "uppercase", fontWeight: "600"
  },
  tabActive: {
    padding: "16px 20px", background: "none", border: "none", borderBottom: "2px solid #C9A84C",
    cursor: "pointer", color: "#C9A84C", fontWeight: "700", fontSize: "13px",
    letterSpacing: "0.5px", textTransform: "uppercase"
  },
  body: { padding: "32px" },
  card: { background: "#FFFFFF", padding: "36px", borderRadius: "6px", maxWidth: "500px", border: "1px solid #EDE7DA" },
  cardTitle: { margin: "0 0 24px", fontSize: "20px", color: "#0D0D0D", fontFamily: "'Georgia', serif", fontWeight: "600" },
  label: {
    display: "block", fontSize: "12px", color: "#555", marginBottom: "6px",
    fontWeight: "600", letterSpacing: "1.5px", textTransform: "uppercase"
  },
  input: {
    width: "100%", padding: "14px 16px", marginBottom: "18px", borderRadius: "4px",
    border: "1px solid #2A2A2A", background: "#FFFFFF", fontSize: "14px",
    boxSizing: "border-box", color: "#0D0D0D", outline: "none", transition: "border-color 0.2s"
  },
  textarea: {
    width: "100%", padding: "14px 16px", marginBottom: "18px", borderRadius: "4px",
    border: "1px solid #2A2A2A", background: "#FFFFFF", fontSize: "14px",
    boxSizing: "border-box", color: "#0D0D0D", outline: "none", height: "90px",
    resize: "vertical", transition: "border-color 0.2s", fontFamily: "'Arial', sans-serif"
  },
  preview: { width: "100%", height: "200px", objectFit: "cover", borderRadius: "4px", marginBottom: "18px", border: "1px solid #EDE7DA" },
  button: {
    width: "100%", padding: "16px", background: "#C9A84C", color: "#0D0D0D",
    border: "none", borderRadius: "4px", fontSize: "13px", cursor: "pointer",
    letterSpacing: "2px", textTransform: "uppercase", fontWeight: "700", transition: "all 0.2s"
  },
  message: { textAlign: "center", marginTop: "14px", color: "#C9A84C", fontSize: "13px" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "20px" },
  dressCard: { background: "#FFFFFF", borderRadius: "6px", overflow: "hidden", border: "1px solid #EDE7DA" },
  dressImg: { width: "100%", height: "180px", objectFit: "cover" },
  dressInfo: { padding: "16px" },
  dressName: { margin: "0 0 8px", fontSize: "15px", color: "#0D0D0D", fontFamily: "'Georgia', serif" },
  dressPrice: { margin: "0 0 6px", color: "#C9A84C", fontWeight: "700" },
  dressDelivery: { margin: 0, color: "#888", fontSize: "13px" },
  bookingCard: { background: "#FFFFFF", borderRadius: "6px", padding: "22px", marginBottom: "14px", border: "1px solid #EDE7DA" },
  bookingTop: { display: "flex", justifyContent: "space-between", alignItems: "flex-start" },
  bookingDress: { margin: "0 0 8px", fontSize: "16px", color: "#0D0D0D", fontFamily: "'Georgia', serif" },
  bookingClient: { margin: "0 0 4px", color: "#555", fontSize: "13px" },
  bookingDates: { margin: "0 0 4px", color: "#555", fontSize: "13px" },
  bookingAddress: { margin: "0 0 4px", color: "#555", fontSize: "13px" },
  bookingPrice: { margin: 0, color: "#C9A84C", fontWeight: "700", fontSize: "13px" },
  statusBadge: { padding: "5px 14px", borderRadius: "20px", fontSize: "11px", fontWeight: "700", letterSpacing: "0.5px" },
  actionRow: { display: "flex", gap: "10px", marginTop: "16px" },
  approveBtn: {
    padding: "9px 22px", background: "transparent", color: "#4CAF50",
    border: "1px solid #4CAF50", borderRadius: "4px", cursor: "pointer",
    fontWeight: "700", fontSize: "12px", letterSpacing: "0.5px", textTransform: "uppercase"
  },
  rejectBtn: {
    padding: "9px 22px", background: "transparent", color: "#EF5350",
    border: "1px solid #EF5350", borderRadius: "4px", cursor: "pointer",
    fontWeight: "700", fontSize: "12px", letterSpacing: "0.5px", textTransform: "uppercase"
  },
  empty: { color: "#AAA", textAlign: "center", padding: "40px", fontSize: "14px" }
};

export default VendorDashboard;