import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function ClientDashboard() {
  const navigate = useNavigate();
  const name = localStorage.getItem("name");
  const client_id = localStorage.getItem("user_id");

  const [dresses, setDresses] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [activeTab, setActiveTab] = useState("browse");
  const [selectedDress, setSelectedDress] = useState(null);
  const [bookingForm, setBookingForm] = useState({
    rental_start: "", rental_end: "", delivery_address: ""
  });
  const [message, setMessage] = useState("");
  const [aiQuestion, setAiQuestion] = useState({ occasion: "", budget: "", style: "" });
  const [aiRecommendation, setAiRecommendation] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    fetchDresses();
    fetchMyBookings();
    // eslint-disable-next-line
  }, []);

  const fetchDresses = async () => {
    try {
      const res = await axios.get("https://amid-project.onrender.com/dresses/all");
      setDresses(res.data);
    } catch (err) { console.log(err); }
  };

  const fetchMyBookings = async () => {
    try {
      const res = await axios.get(`https://amid-project.onrender.com/bookings/client/${client_id}`);
      setMyBookings(res.data);
    } catch (err) { console.log(err); }
  };

  const handleBook = async (dress) => {
    setSelectedDress(dress);
    setActiveTab("book");
  };

  const calculateTotal = () => {
    if (!bookingForm.rental_start || !bookingForm.rental_end || !selectedDress) return 0;
    const start = new Date(bookingForm.rental_start);
    const end = new Date(bookingForm.rental_end);
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    return days > 0 ? days * selectedDress.price_per_day : 0;
  };

  const submitBooking = async () => {
    try {
      const total = calculateTotal();
      if (total <= 0) { setMessage("Please select valid dates."); return; }
      if (!bookingForm.delivery_address) { setMessage("Please enter delivery address."); return; }
      await axios.post("https://amid-project.onrender.com/bookings/create", {
        client_id: parseInt(client_id),
        dress_id: selectedDress.id,
        rental_start: bookingForm.rental_start,
        rental_end: bookingForm.rental_end,
        delivery_address: bookingForm.delivery_address,
        total_price: total
      });
      setMessage("Booking request sent! Waiting for vendor approval.");
      setBookingForm({ rental_start: "", rental_end: "", delivery_address: "" });
      fetchMyBookings();
      setTimeout(() => { setActiveTab("mybookings"); setMessage(""); }, 2000);
    } catch (err) {
      setMessage("Booking failed. Please try again.");
    }
  };

  const getAiRecommendation = async () => {
    if (!aiQuestion.occasion || !aiQuestion.budget || !aiQuestion.style) {
      setAiRecommendation("Please fill in all 3 fields!");
      return;
    }
    setAiLoading(true);
    setAiRecommendation("");
    try {
      const res = await axios.post("https://amid-project.onrender.com/ai/recommend", {
        occasion: aiQuestion.occasion,
        budget: parseFloat(aiQuestion.budget),
        style: aiQuestion.style
      });
      setAiRecommendation(res.data.recommendation);
    } catch (err) {
      setAiRecommendation("AI is unavailable right now. Please try again.");
    }
    setAiLoading(false);
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
        <button style={activeTab === "browse" ? styles.tabActive : styles.tab}
          onClick={() => setActiveTab("browse")}>Browse Dresses</button>
        <button style={activeTab === "mybookings" ? styles.tabActive : styles.tab}
          onClick={() => setActiveTab("mybookings")}>My Bookings ({myBookings.length})</button>
        <button style={activeTab === "ai" ? styles.tabActive : styles.tab}
          onClick={() => setActiveTab("ai")}>✨ AI Stylist</button>
      </div>

      <div style={styles.body}>

        {/* Browse Tab */}
        {activeTab === "browse" && (
          <div>
            <h3 style={styles.sectionTitle}>Available Dresses</h3>
            {dresses.length === 0 && <p style={styles.empty}>No dresses available yet.</p>}
            <div style={styles.grid}>
              {dresses.map(dress => (
                <div key={dress.id} style={styles.dressCard}>
                  <img src={dress.image_url} alt={dress.name} style={styles.dressImg} />
                  <div style={styles.dressInfo}>
                    <h4 style={styles.dressName}>{dress.name}</h4>
                    <p style={styles.dressDesc}>{dress.description}</p>
                    <p style={styles.dressPrice}>₹{dress.price_per_day}/day</p>
                    <p style={styles.dressDelivery}>🚚 {dress.delivery_days} days delivery</p>
                    <button style={styles.bookBtn} onClick={() => handleBook(dress)}>
                      Book Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Booking Form Tab */}
        {activeTab === "book" && selectedDress && (
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Book — {selectedDress.name}</h3>
            <img src={selectedDress.image_url} alt={selectedDress.name} style={styles.preview} />
            <p style={styles.dressPrice}>₹{selectedDress.price_per_day}/day</p>
            <label style={styles.label}>Rental Start Date</label>
            <input style={styles.input} type="date" value={bookingForm.rental_start}
              onChange={e => setBookingForm({ ...bookingForm, rental_start: e.target.value })} />
            <label style={styles.label}>Rental End Date</label>
            <input style={styles.input} type="date" value={bookingForm.rental_end}
              onChange={e => setBookingForm({ ...bookingForm, rental_end: e.target.value })} />
            <label style={styles.label}>Delivery Address</label>
            <textarea style={styles.textarea} placeholder="Enter your full delivery address"
              value={bookingForm.delivery_address}
              onChange={e => setBookingForm({ ...bookingForm, delivery_address: e.target.value })} />
            {calculateTotal() > 0 && (
              <div style={styles.totalBox}>Total: ₹{calculateTotal()}</div>
            )}
            {message && <p style={styles.message}>{message}</p>}
            <div style={{ display: "flex", gap: "10px" }}>
              <button style={styles.backBtn} onClick={() => setActiveTab("browse")}>← Back</button>
              <button style={styles.button} onClick={submitBooking}>Confirm Booking</button>
            </div>
          </div>
        )}

        {/* My Bookings Tab */}
        {activeTab === "mybookings" && (
          <div>
            <h3 style={styles.sectionTitle}>My Bookings</h3>
            {myBookings.length === 0 && <p style={styles.empty}>No bookings yet.</p>}
            {myBookings.map(booking => (
              <div key={booking.booking_id} style={styles.bookingCard}>
                <div style={styles.bookingRow}>
                  <img src={booking.dress_image} alt={booking.dress_name} style={styles.bookingImg} />
                  <div style={styles.bookingDetails}>
                    <h4 style={styles.bookingDress}>{booking.dress_name}</h4>
                    <p style={styles.bookingMeta}>📅 {booking.rental_start} to {booking.rental_end}</p>
                    <p style={styles.bookingMeta}>💰 ₹{booking.total_price}</p>
                  </div>
                  <span style={{
                    ...styles.statusBadge,
                    background: booking.status === "approved" ? "#e8f5e9" :
                      booking.status === "rejected" ? "#ffebee" : "#fff8e1",
                    color: booking.status === "approved" ? "#2e7d32" :
                      booking.status === "rejected" ? "#c62828" : "#f57f17"
                  }}>{booking.status.toUpperCase()}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* AI Stylist Tab */}
        {activeTab === "ai" && (
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>✨ AI Dress Stylist</h3>
            <p style={{ color: "#888", fontSize: "13px", marginBottom: "20px" }}>
              Answer 3 quick questions and our AI will recommend the perfect dress for you!
            </p>
            <label style={styles.label}>What is the occasion?</label>
            <input style={styles.input} placeholder="e.g. wedding, birthday, festival"
              value={aiQuestion.occasion}
              onChange={e => setAiQuestion({ ...aiQuestion, occasion: e.target.value })} />
            <label style={styles.label}>Your budget per day (₹)</label>
            <input style={styles.input} type="number" placeholder="e.g. 2000"
              value={aiQuestion.budget}
              onChange={e => setAiQuestion({ ...aiQuestion, budget: e.target.value })} />
            <label style={styles.label}>Style preference</label>
            <input style={styles.input} placeholder="e.g. traditional, modern, elegant"
              value={aiQuestion.style}
              onChange={e => setAiQuestion({ ...aiQuestion, style: e.target.value })} />
            <button style={styles.button} onClick={getAiRecommendation}>
              {aiLoading ? "Finding your perfect dress... 🔍" : "Get AI Recommendation ✨"}
            </button>
            {aiRecommendation && (
              <div style={styles.aiResult}>
                <p style={{ margin: 0, lineHeight: "1.7", fontSize: "14px" }}>
                  {aiRecommendation}
                </p>
              </div>
            )}
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
  sectionTitle: { margin: "0 0 20px", fontSize: "18px", color: "#333" },
  card: { background: "white", padding: "32px", borderRadius: "12px", maxWidth: "500px" },
  cardTitle: { margin: "0 0 16px", fontSize: "18px", color: "#333" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "16px" },
  dressCard: { background: "white", borderRadius: "12px", overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" },
  dressImg: { width: "100%", height: "200px", objectFit: "cover" },
  dressInfo: { padding: "16px" },
  dressName: { margin: "0 0 6px", fontSize: "15px", color: "#333" },
  dressDesc: { margin: "0 0 8px", color: "#888", fontSize: "13px", lineHeight: "1.4" },
  dressPrice: { margin: "0 0 4px", color: "#c0392b", fontWeight: "600" },
  dressDelivery: { margin: "0 0 12px", color: "#888", fontSize: "13px" },
  bookBtn: { width: "100%", padding: "10px", background: "#c0392b", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "600" },
  preview: { width: "100%", height: "180px", objectFit: "cover", borderRadius: "8px", marginBottom: "12px" },
  label: { display: "block", fontSize: "13px", color: "#555", marginBottom: "4px", fontWeight: "500" },
  input: { width: "100%", padding: "12px", marginBottom: "12px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "14px", boxSizing: "border-box" },
  textarea: { width: "100%", padding: "12px", marginBottom: "12px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "14px", boxSizing: "border-box", height: "80px" },
  totalBox: { background: "#fef9f9", border: "1px solid #c0392b", borderRadius: "8px", padding: "12px 16px", marginBottom: "16px", color: "#c0392b", fontWeight: "700", fontSize: "16px" },
  button: { width: "100%", padding: "14px", background: "#c0392b", color: "white", border: "none", borderRadius: "8px", fontSize: "15px", cursor: "pointer", marginBottom: "8px" },
  backBtn: { padding: "14px 20px", background: "#f5f5f5", color: "#555", border: "none", borderRadius: "8px", fontSize: "15px", cursor: "pointer" },
  message: { textAlign: "center", color: "#c0392b", marginBottom: "12px" },
  bookingCard: { background: "white", borderRadius: "12px", padding: "16px", marginBottom: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" },
  bookingRow: { display: "flex", gap: "16px", alignItems: "center" },
  bookingImg: { width: "80px", height: "80px", objectFit: "cover", borderRadius: "8px" },
  bookingDetails: { flex: 1 },
  bookingDress: { margin: "0 0 4px", fontSize: "15px", color: "#333" },
  bookingMeta: { margin: "0 0 2px", fontSize: "13px", color: "#888" },
  statusBadge: { padding: "6px 14px", borderRadius: "20px", fontSize: "12px", fontWeight: "700", whiteSpace: "nowrap" },
  empty: { color: "#aaa", textAlign: "center", padding: "60px" },
  aiResult: { background: "#fef9f9", border: "1px solid #c0392b", borderRadius: "8px", padding: "16px", marginTop: "16px" }
};

export default ClientDashboard;