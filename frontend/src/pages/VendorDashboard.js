import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

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
  }, []);

  const fetchMyDresses = async () => {
    try {
      const res = await axios.get(`http://localhost:8000/dresses/vendor/${vendor_id}`);
      setMyDresses(res.data);
    } catch (err) { console.log(err); }
  };

  const fetchBookings = async () => {
    try {
      const res = await axios.get(`http://localhost:8000/bookings/vendor/${vendor_id}`);
      setBookings(res.data);
    } catch (err) { console.log(err); }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleUpload = async () => {
    try {
      await axios.post("http://localhost:8000/dresses/upload", {
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
      await axios.put(`http://localhost:8000/bookings/update/${booking_id}?status=${status}`);
      fetchBookings();
    } catch (err) { console.log(err); }
  };

  const logout = () => { localStorage.clear(); navigate("/login"); };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h2 style={styles.logo}>AmId</h2>
        <div style={styles.headerRight}>
          <span style={styles.welcome}>Welcome, {name} 👋</span>
          <button style={styles.logoutBtn} onClick={logout}>Logout</button>
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
              value={form.image_url} onChange={handleChange} />

            <label style={styles.label}>Price per Day (₹)</label>
            <input style={styles.input} name="price_per_day" placeholder="e.g. 999"
              type="number" value={form.price_per_day} onChange={handleChange} />

            <label style={styles.label}>Delivery Days</label>
            <input style={styles.input} name="delivery_days" placeholder="e.g. 2"
              type="number" value={form.delivery_days} onChange={handleChange} />

            <label style={styles.label}>Dress Name</label>
            <input style={styles.input} name="name" placeholder="Dress Name"
              value={form.name} onChange={handleChange} />

            <label style={styles.label}>Description</label>
            <textarea style={styles.textarea} name="description" placeholder="Description"
              value={form.description} onChange={handleChange} />

            {form.image_url && (
              <img src={form.image_url} alt="preview" style={styles.preview} />
            )}

            <button style={styles.button} onClick={handleUpload}>Upload Dress</button>
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
                    <p style={styles.dressDelivery}>🚚 {dress.delivery_days} days delivery</p>
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
                    <p style={styles.bookingClient}>👤 {booking.client_name} — {booking.client_email}</p>
                    <p style={styles.bookingDates}>📅 {booking.rental_start} to {booking.rental_end}</p>
                    <p style={styles.bookingAddress}>📍 {booking.delivery_address}</p>
                    <p style={styles.bookingPrice}>💰 ₹{booking.total_price}</p>
                  </div>
                  <div>
                    <span style={{
                      ...styles.statusBadge,
                      background: booking.status === "approved" ? "#e8f5e9" :
                        booking.status === "rejected" ? "#ffebee" : "#fff8e1",
                      color: booking.status === "approved" ? "#2e7d32" :
                        booking.status === "rejected" ? "#c62828" : "#f57f17"
                    }}>{booking.status.toUpperCase()}</span>
                  </div>
                </div>
                {booking.status === "pending" && (
                  <div style={styles.actionRow}>
                    <button style={styles.approveBtn}
                      onClick={() => handleApproval(booking.booking_id, "approved")}>
                      ✅ Approve
                    </button>
                    <button style={styles.rejectBtn}
                      onClick={() => handleApproval(booking.booking_id, "rejected")}>
                      ❌ Reject
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
  container: { minHeight: "100vh", background: "#f8f4f0" },
  header: { background: "white", padding: "16px 32px", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" },
  logo: { color: "#c0392b", margin: 0, fontSize: "24px" },
  headerRight: { display: "flex", alignItems: "center", gap: "16px" },
  welcome: { fontSize: "14px", color: "#555" },
  logoutBtn: { padding: "8px 16px", background: "#c0392b", color: "white", border: "none", borderRadius: "8px", cursor: "pointer" },
  tabBar: { background: "white", padding: "0 32px", display: "flex", gap: "4px", borderBottom: "1px solid #eee" },
  tab: { padding: "14px 20px", background: "none", border: "none", cursor: "pointer", color: "#888", fontSize: "14px" },
  tabActive: { padding: "14px 20px", background: "none", border: "none", borderBottom: "2px solid #c0392b", cursor: "pointer", color: "#c0392b", fontWeight: "600", fontSize: "14px" },
  body: { padding: "32px" },
  card: { background: "white", padding: "32px", borderRadius: "12px", maxWidth: "500px" },
  cardTitle: { margin: "0 0 20px", fontSize: "18px", color: "#333" },
  label: { display: "block", fontSize: "13px", color: "#555", marginBottom: "4px", fontWeight: "500" },
  input: { width: "100%", padding: "12px", marginBottom: "12px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "14px", boxSizing: "border-box" },
  textarea: { width: "100%", padding: "12px", marginBottom: "12px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "14px", boxSizing: "border-box", height: "80px", resize: "vertical" },
  preview: { width: "100%", height: "180px", objectFit: "cover", borderRadius: "8px", marginBottom: "12px" },
  button: { width: "100%", padding: "14px", background: "#c0392b", color: "white", border: "none", borderRadius: "8px", fontSize: "16px", cursor: "pointer" },
  message: { textAlign: "center", marginTop: "12px", color: "#c0392b" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "16px" },
  dressCard: { background: "white", borderRadius: "12px", overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" },
  dressImg: { width: "100%", height: "180px", objectFit: "cover" },
  dressInfo: { padding: "14px" },
  dressName: { margin: "0 0 6px", fontSize: "15px", color: "#333" },
  dressPrice: { margin: "0 0 4px", color: "#c0392b", fontWeight: "600" },
  dressDelivery: { margin: 0, color: "#888", fontSize: "13px" },
  bookingCard: { background: "white", borderRadius: "12px", padding: "20px", marginBottom: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" },
  bookingTop: { display: "flex", justifyContent: "space-between", alignItems: "flex-start" },
  bookingDress: { margin: "0 0 6px", fontSize: "16px", color: "#333" },
  bookingClient: { margin: "0 0 4px", color: "#555", fontSize: "13px" },
  bookingDates: { margin: "0 0 4px", color: "#555", fontSize: "13px" },
  bookingAddress: { margin: "0 0 4px", color: "#555", fontSize: "13px" },
  bookingPrice: { margin: 0, color: "#c0392b", fontWeight: "600", fontSize: "13px" },
  statusBadge: { padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "600" },
  actionRow: { display: "flex", gap: "10px", marginTop: "14px" },
  approveBtn: { padding: "8px 20px", background: "#e8f5e9", color: "#2e7d32", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "600" },
  rejectBtn: { padding: "8px 20px", background: "#ffebee", color: "#c62828", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "600" },
  empty: { color: "#aaa", textAlign: "center", padding: "40px" }
};

export default VendorDashboard;