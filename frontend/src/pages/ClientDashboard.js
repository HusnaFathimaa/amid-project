import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import logo from "./logo.jpg";

const CATEGORY_META = [
  { name: "Ethnic", from: "#5C1A1A", to: "#2B0D0D" },
  { name: "Party", from: "#1A1A5C", to: "#0D0D2B" },
  { name: "Wedding", from: "#7A1F3D", to: "#3D0F1F" },
  { name: "Casual", from: "#1F4D3D", to: "#0F261F" },
  { name: "Western", from: "#4D3D1F", to: "#261F0F" },
];

const PRICE_RANGES = [
  { label: "All Prices", min: 0, max: Infinity },
  { label: "Under ₹500", min: 0, max: 500 },
  { label: "₹500 – ₹1000", min: 500, max: 1000 },
  { label: "₹1000 – ₹1500", min: 1000, max: 1500 },
  { label: "Above ₹1500", min: 1500, max: Infinity },
];

// Dresses are named like "[Ethnic] Silk Saree" -- this pulls out the
// category tag and the clean display name without touching the backend.
function parseDress(dress) {
  const match = dress.name.match(/^\[(.*?)\]\s*(.*)/);
  if (match) {
    return { ...dress, category: match[1], displayName: match[2] };
  }
  return { ...dress, category: "Western", displayName: dress.name };
}

// Cosmetic "original price" + discount badge for a Myntra-style look.
// This is a display-only calculation, not a real backend discount.
function withDiscount(dress) {
  const originalPrice = Math.round(dress.price_per_day * 1.4 / 10) * 10;
  const percentOff = Math.round(((originalPrice - dress.price_per_day) / originalPrice) * 100);
  return { ...dress, originalPrice, percentOff };
}

function ClientDashboard() {
  const navigate = useNavigate();
  const name = localStorage.getItem("name");
  const client_id = localStorage.getItem("user_id");

  const [dresses, setDresses] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [activeTab, setActiveTab] = useState("browse");
  const [browseView, setBrowseView] = useState("home"); // "home" or "category"
  const [activeCategory, setActiveCategory] = useState(null);
  const [activePriceRange, setActivePriceRange] = useState(PRICE_RANGES[0]);
  const [selectedDress, setSelectedDress] = useState(null);
  const [bookingForm, setBookingForm] = useState({
    rental_start: "", rental_end: "", delivery_address: ""
  });
  const [bookedDates, setBookedDates] = useState([]);
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

  const fetchBookedDates = async (dress_id) => {
    try {
      const res = await axios.get(`https://amid-project.onrender.com/dresses/${dress_id}/booked-dates`);
      setBookedDates(res.data.booked_dates);
    } catch (err) { console.log(err); }
  };

  const openCategory = (categoryName) => {
    setActiveCategory(categoryName);
    setActivePriceRange(PRICE_RANGES[0]);
    setBrowseView("category");
  };

  const backToHome = () => {
    setBrowseView("home");
    setActiveCategory(null);
  };

  const handleBook = async (dress) => {
    setSelectedDress(dress);
    await fetchBookedDates(dress.id);
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

  const parsedDresses = dresses.map(parseDress).map(withDiscount);
  const filteredDresses = parsedDresses
    .filter(d => d.category === activeCategory)
    .filter(d => d.price_per_day >= activePriceRange.min && d.price_per_day <= activePriceRange.max);

  // Pick one real dress photo per category (from what the vendor already uploaded)
  // to use as the tile background -- falls back to a plain color if none exist yet.
  const categoryTiles = CATEGORY_META.map(cat => {
    const match = parsedDresses.find(d => d.category === cat.name);
    return { ...cat, image: match ? match.image_url : null };
  });

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
        <button style={activeTab === "browse" ? styles.tabActive : styles.tab}
          onClick={() => { setActiveTab("browse"); setBrowseView("home"); }}>Browse Dresses</button>
        <button style={activeTab === "mybookings" ? styles.tabActive : styles.tab}
          onClick={() => setActiveTab("mybookings")}>My Bookings ({myBookings.length})</button>
        <button style={activeTab === "ai" ? styles.tabActive : styles.tab}
          onClick={() => setActiveTab("ai")}>AI Stylist</button>
      </div>

      <div style={styles.body}>

        {/* Browse Tab -- HOME VIEW */}
        {activeTab === "browse" && browseView === "home" && (
          <div>
            <div style={styles.hero}>
              <img src={logo} alt="AmId" style={styles.heroLogo} />
              <p style={styles.heroTagline}>OWN THE LOOK</p>
              <p style={styles.heroDesc}>India's premier dress rental marketplace — designer wear for every occasion, delivered to your door.</p>
            </div>

            <div style={styles.offerBanner}>
              <div>
                <p style={styles.offerTitle}>FESTIVE RENTAL SALE</p>
                <p style={styles.offerSub}>Up to 40% off on select styles this season</p>
              </div>
              <span style={styles.offerBadge}>LIMITED TIME</span>
            </div>

            <h3 style={styles.sectionTitle}>Shop by Category</h3>
            <div style={styles.tileGrid}>
              {categoryTiles.map(tile => (
                <div
                  key={tile.name}
                  style={{
                    ...styles.tile,
                    background: `linear-gradient(180deg, rgba(0,0,0,0.15) 0%, ${tile.to} 85%), linear-gradient(135deg, ${tile.from}, ${tile.to})`
                  }}
                  onClick={() => openCategory(tile.name)}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-6px)"; e.currentTarget.style.boxShadow = "0 14px 28px rgba(0,0,0,0.35)"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 10px rgba(0,0,0,0.15)"; }}
                >
                  {tile.image && (
                    <img src={tile.image} alt={tile.name} style={styles.tileImg} />
                  )}
                  <div style={styles.tileOverlay}>
                    <p style={styles.tileLabel}>{tile.name}</p>
                    <p style={styles.tileSub}>Shop Now →</p>
                  </div>
                </div>
              ))}

              {/* Promo tile 1 */}
              <div
                style={styles.promoTile}
                onClick={() => setActiveTab("ai")}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-6px)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; }}
              >
                <p style={styles.promoIcon}>✦</p>
                <p style={styles.promoTitle}>AI STYLIST</p>
                <p style={styles.promoSub}>Get personalized dress picks in seconds</p>
              </div>

              {/* Promo tile 2 */}
              <div
                style={styles.promoTile}
                onClick={() => setActiveTab("mybookings")}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-6px)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; }}
              >
                <p style={styles.promoIcon}>⌚</p>
                <p style={styles.promoTitle}>TRACK BOOKINGS</p>
                <p style={styles.promoSub}>See status on all your current rentals</p>
              </div>
            </div>
          </div>
        )}

        {/* Browse Tab -- CATEGORY VIEW */}
        {activeTab === "browse" && browseView === "category" && (
          <div>
            <button style={styles.backBtn} onClick={backToHome}>← Back to Categories</button>

            <h3 style={styles.sectionTitle}>
              {activeCategory} Wear
              <span style={styles.resultCount}> ({filteredDresses.length})</span>
            </h3>

            <div style={styles.categoryRow}>
              {PRICE_RANGES.map(range => (
                <button
                  key={range.label}
                  style={activePriceRange.label === range.label ? styles.categoryChipActive : styles.categoryChip}
                  onClick={() => setActivePriceRange(range)}
                >
                  {range.label}
                </button>
              ))}
            </div>

            {filteredDresses.length === 0 && <p style={styles.empty}>No dresses available in this range yet.</p>}
            <div style={styles.grid}>
              {filteredDresses.map(dress => (
                <div key={dress.id} style={styles.dressCard}>
                  <div style={styles.imgWrap}>
                    <img src={dress.image_url} alt={dress.displayName} style={styles.dressImg} />
                    <span style={styles.discountBadge}>{dress.percentOff}% OFF</span>
                  </div>
                  <div style={styles.dressInfo}>
                    <span style={styles.categoryTag}>{dress.category}</span>
                    <h4 style={styles.dressName}>{dress.displayName}</h4>
                    <p style={styles.dressDesc}>{dress.description}</p>
                    <div style={styles.priceRow}>
                      <span style={styles.dressPrice}>₹{dress.price_per_day}/day</span>
                      <span style={styles.strikePrice}>₹{dress.originalPrice}</span>
                    </div>
                    <p style={styles.dressDelivery}>Delivery in {dress.delivery_days} days</p>
                    <button
                      style={styles.bookBtn}
                      onClick={() => handleBook(dress)}
                      onMouseEnter={e => { e.target.style.background = "#B8922E"; }}
                      onMouseLeave={e => { e.target.style.background = "#C9A84C"; }}
                    >
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
            <h3 style={styles.cardTitle}>Book — {selectedDress.displayName || selectedDress.name}</h3>
            <img src={selectedDress.image_url} alt={selectedDress.name} style={styles.preview} />
            <p style={styles.dressPrice}>₹{selectedDress.price_per_day}/day</p>
            <label style={styles.label}>Rental Start Date</label>
            <input style={styles.input} type="date"
              min={new Date().toISOString().split("T")[0]}
              value={bookingForm.rental_start}
              onChange={e => {
                const selected = e.target.value;
                if (bookedDates.includes(selected)) {
                  setMessage("This date is already booked. Please choose another date.");
                  return;
                }
                setMessage("");
                setBookingForm({ ...bookingForm, rental_start: selected });
              }}
              onFocus={e => e.target.style.borderColor = "#C9A84C"}
              onBlur={e => e.target.style.borderColor = "#2A2A2A"} />
            <label style={styles.label}>Rental End Date</label>
            <input style={styles.input} type="date"
              min={bookingForm.rental_start || new Date().toISOString().split("T")[0]}
              value={bookingForm.rental_end}
              onChange={e => {
                const selected = e.target.value;
                if (bookedDates.includes(selected)) {
                  setMessage("This date is already booked. Please choose another date.");
                  return;
                }
                setMessage("");
                setBookingForm({ ...bookingForm, rental_end: selected });
              }}
              onFocus={e => e.target.style.borderColor = "#C9A84C"}
              onBlur={e => e.target.style.borderColor = "#2A2A2A"} />
            {bookedDates.length > 0 && (
              <div style={styles.bookedHint}>
                Some dates are already booked for this dress. Booked dates will be rejected.
              </div>
            )}
            <label style={styles.label}>Delivery Address</label>
            <textarea style={styles.textarea} placeholder="Enter your full delivery address"
              value={bookingForm.delivery_address}
              onChange={e => setBookingForm({ ...bookingForm, delivery_address: e.target.value })}
              onFocus={e => e.target.style.borderColor = "#C9A84C"}
              onBlur={e => e.target.style.borderColor = "#2A2A2A"} />
            {calculateTotal() > 0 && (
              <div style={styles.totalBox}>Total: ₹{calculateTotal()}</div>
            )}
            {message && <p style={styles.message}>{message}</p>}
            <div style={{ display: "flex", gap: "10px" }}>
              <button style={styles.backBtnSmall} onClick={() => { setActiveTab("browse"); setBrowseView("category"); }}>Back</button>
              <button
                style={styles.button}
                onClick={submitBooking}
                onMouseEnter={e => { e.target.style.background = "#B8922E"; }}
                onMouseLeave={e => { e.target.style.background = "#C9A84C"; }}
              >
                Confirm Booking
              </button>
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
                    <p style={styles.bookingMeta}>{booking.rental_start} to {booking.rental_end}</p>
                    <p style={styles.bookingMeta}>₹{booking.total_price}</p>
                  </div>
                  <span style={{
                    ...styles.statusBadge,
                    background: booking.status === "approved" ? "rgba(46,125,50,0.15)" :
                      booking.status === "rejected" ? "rgba(198,40,40,0.15)" : "rgba(201,168,76,0.15)",
                    color: booking.status === "approved" ? "#4CAF50" :
                      booking.status === "rejected" ? "#EF5350" : "#C9A84C"
                  }}>{booking.status.toUpperCase()}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* AI Stylist Tab */}
        {activeTab === "ai" && (
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>AI Dress Stylist</h3>
            <p style={styles.aiIntro}>
              Answer 3 quick questions and our AI will recommend the perfect dress for you.
            </p>
            <label style={styles.label}>What is the occasion?</label>
            <input style={styles.input} placeholder="e.g. wedding, birthday, festival"
              value={aiQuestion.occasion}
              onChange={e => setAiQuestion({ ...aiQuestion, occasion: e.target.value })}
              onFocus={e => e.target.style.borderColor = "#C9A84C"}
              onBlur={e => e.target.style.borderColor = "#2A2A2A"} />
            <label style={styles.label}>Your budget per day (₹)</label>
            <input style={styles.input} type="number" placeholder="e.g. 2000"
              value={aiQuestion.budget}
              onChange={e => setAiQuestion({ ...aiQuestion, budget: e.target.value })}
              onFocus={e => e.target.style.borderColor = "#C9A84C"}
              onBlur={e => e.target.style.borderColor = "#2A2A2A"} />
            <label style={styles.label}>Style preference</label>
            <input style={styles.input} placeholder="e.g. traditional, modern, elegant"
              value={aiQuestion.style}
              onChange={e => setAiQuestion({ ...aiQuestion, style: e.target.value })}
              onFocus={e => e.target.style.borderColor = "#C9A84C"}
              onBlur={e => e.target.style.borderColor = "#2A2A2A"} />
            <button
              style={styles.button}
              onClick={getAiRecommendation}
              onMouseEnter={e => { e.target.style.background = "#B8922E"; }}
              onMouseLeave={e => { e.target.style.background = "#C9A84C"; }}
            >
              {aiLoading ? "Finding your perfect dress..." : "Get AI Recommendation"}
            </button>
            {aiRecommendation && (
              <div style={styles.aiResult}>
                <p style={styles.aiResultText}>
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

  hero: { textAlign: "center", padding: "20px 0 28px" },
  heroLogo: { width: "80px", height: "80px", objectFit: "contain", marginBottom: "12px" },
  heroTagline: { color: "#C9A84C", fontSize: "22px", letterSpacing: "6px", fontFamily: "'Georgia', serif", margin: "0 0 10px", fontWeight: "600" },
  heroDesc: { color: "#888", fontSize: "14px", maxWidth: "480px", margin: "0 auto", lineHeight: "1.6" },

  offerBanner: {
    background: "linear-gradient(135deg, #0D0D0D 0%, #2A2210 100%)",
    borderRadius: "8px", padding: "22px 26px", marginBottom: "32px",
    display: "flex", justifyContent: "space-between", alignItems: "center",
    border: "1px solid #C9A84C"
  },
  offerTitle: { margin: "0 0 6px", color: "#C9A84C", fontSize: "18px", fontFamily: "'Georgia', serif", letterSpacing: "1px", fontWeight: "700" },
  offerSub: { margin: 0, color: "#DDD", fontSize: "13px" },
  offerBadge: {
    background: "#C9A84C", color: "#0D0D0D", padding: "6px 14px", borderRadius: "20px",
    fontSize: "11px", fontWeight: "700", letterSpacing: "1px", whiteSpace: "nowrap"
  },

  tileGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "18px" },
  tile: {
    cursor: "pointer", borderRadius: "10px", overflow: "hidden", position: "relative",
    height: "260px", transition: "transform 0.25s, box-shadow 0.25s",
    boxShadow: "0 4px 10px rgba(0,0,0,0.15)"
  },
  tileImg: {
    position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
    objectFit: "cover", opacity: 0.55
  },
  tileOverlay: {
    position: "absolute", bottom: 0, left: 0, right: 0, padding: "18px",
    background: "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.75) 100%)"
  },
  tileLabel: { margin: "0 0 4px", color: "#F5E6B8", fontFamily: "'Georgia', serif", fontWeight: "700", fontSize: "22px", letterSpacing: "1px" },
  tileSub: { margin: 0, color: "#C9A84C", fontSize: "12px", fontWeight: "600", letterSpacing: "0.5px" },

  promoTile: {
    cursor: "pointer", borderRadius: "10px", height: "260px", display: "flex",
    flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center",
    background: "#FFFFFF", border: "1px solid #EDE7DA", padding: "20px",
    transition: "transform 0.25s"
  },
  promoIcon: { fontSize: "32px", color: "#C9A84C", margin: "0 0 12px" },
  promoTitle: { fontSize: "16px", fontFamily: "'Georgia', serif", fontWeight: "700", color: "#0D0D0D", margin: "0 0 8px", letterSpacing: "1px" },
  promoSub: { fontSize: "12px", color: "#888", margin: 0, lineHeight: "1.5" },

  categoryRow: { display: "flex", gap: "10px", marginBottom: "24px", flexWrap: "wrap" },
  categoryChip: {
    padding: "9px 20px", borderRadius: "20px", border: "1px solid #DDD",
    background: "#FFFFFF", color: "#555", fontSize: "13px", cursor: "pointer",
    fontWeight: "600", transition: "all 0.2s"
  },
  categoryChipActive: {
    padding: "9px 20px", borderRadius: "20px", border: "1px solid #0D0D0D",
    background: "#0D0D0D", color: "#C9A84C", fontSize: "13px", cursor: "pointer",
    fontWeight: "700", transition: "all 0.2s"
  },

  sectionTitle: { margin: "0 0 20px", fontSize: "20px", color: "#0D0D0D", fontFamily: "'Georgia', serif", fontWeight: "600" },
  resultCount: { color: "#AAA", fontSize: "15px", fontFamily: "'Arial', sans-serif", fontWeight: "400" },

  card: { background: "#FFFFFF", padding: "36px", borderRadius: "6px", maxWidth: "500px", border: "1px solid #EDE7DA" },
  cardTitle: { margin: "0 0 20px", fontSize: "20px", color: "#0D0D0D", fontFamily: "'Georgia', serif", fontWeight: "600" },

  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "20px" },
  dressCard: {
    background: "#FFFFFF", borderRadius: "6px", overflow: "hidden", border: "1px solid #EDE7DA",
    transition: "box-shadow 0.2s"
  },
  imgWrap: { position: "relative" },
  dressImg: { width: "100%", height: "260px", objectFit: "cover" },
  discountBadge: {
    position: "absolute", top: "10px", left: "10px", background: "#0D0D0D",
    color: "#C9A84C", fontSize: "11px", fontWeight: "700", padding: "4px 10px",
    borderRadius: "3px", letterSpacing: "0.5px"
  },
  dressInfo: { padding: "16px" },
  categoryTag: { fontSize: "11px", color: "#C9A84C", fontWeight: "700", letterSpacing: "1px", textTransform: "uppercase" },
  dressName: { margin: "4px 0 8px", fontSize: "15px", color: "#0D0D0D", fontFamily: "'Georgia', serif" },
  dressDesc: { margin: "0 0 10px", color: "#888", fontSize: "13px", lineHeight: "1.4" },
  priceRow: { display: "flex", alignItems: "baseline", gap: "8px", marginBottom: "6px" },
  dressPrice: { color: "#0D0D0D", fontWeight: "700", fontSize: "15px" },
  strikePrice: { color: "#AAA", fontSize: "13px", textDecoration: "line-through" },
  dressDelivery: { margin: "0 0 14px", color: "#888", fontSize: "13px" },
  bookBtn: {
    width: "100%", padding: "11px", background: "#C9A84C", color: "#0D0D0D",
    border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "700",
    fontSize: "12px", letterSpacing: "1.5px", textTransform: "uppercase", transition: "background 0.2s"
  },

  preview: { width: "100%", height: "200px", objectFit: "cover", borderRadius: "4px", marginBottom: "18px", border: "1px solid #EDE7DA" },
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
  totalBox: {
    background: "rgba(201,168,76,0.1)", border: "1px solid #C9A84C", borderRadius: "4px",
    padding: "14px 18px", marginBottom: "18px", color: "#0D0D0D", fontWeight: "700", fontSize: "16px"
  },
  button: {
    width: "100%", padding: "16px", background: "#C9A84C", color: "#0D0D0D",
    border: "none", borderRadius: "4px", fontSize: "13px", cursor: "pointer",
    letterSpacing: "2px", textTransform: "uppercase", fontWeight: "700", transition: "all 0.2s"
  },
  backBtn: {
    padding: "10px 20px", background: "transparent", color: "#0D0D0D",
    border: "1px solid #DDD", borderRadius: "4px", fontSize: "13px",
    cursor: "pointer", fontWeight: "600", marginBottom: "24px"
  },
  backBtnSmall: {
    padding: "16px 24px", background: "transparent", color: "#555",
    border: "1px solid #DDD", borderRadius: "4px", fontSize: "13px",
    cursor: "pointer", letterSpacing: "1px", textTransform: "uppercase", fontWeight: "600"
  },
  message: { textAlign: "center", color: "#C9A84C", marginBottom: "12px", fontSize: "13px" },
  bookedHint: {
    background: "rgba(239,83,80,0.08)", border: "1px solid #EF5350",
    borderRadius: "4px", padding: "10px 14px", marginBottom: "16px",
    color: "#EF5350", fontSize: "12px"
  },
  bookingCard: { background: "#FFFFFF", borderRadius: "6px", padding: "18px", marginBottom: "14px", border: "1px solid #EDE7DA" },
  bookingRow: { display: "flex", gap: "16px", alignItems: "center" },
  bookingImg: { width: "80px", height: "80px", objectFit: "cover", borderRadius: "4px" },
  bookingDetails: { flex: 1 },
  bookingDress: { margin: "0 0 6px", fontSize: "15px", color: "#0D0D0D", fontFamily: "'Georgia', serif" },
  bookingMeta: { margin: "0 0 3px", fontSize: "13px", color: "#888" },
  statusBadge: { padding: "6px 14px", borderRadius: "20px", fontSize: "11px", fontWeight: "700", letterSpacing: "0.5px", whiteSpace: "nowrap" },
  empty: { color: "#AAA", textAlign: "center", padding: "60px", fontSize: "14px" },
  aiIntro: { color: "#888", fontSize: "13px", marginBottom: "24px", lineHeight: "1.6" },
  aiResult: {
    background: "rgba(201,168,76,0.08)", border: "1px solid #C9A84C",
    borderRadius: "4px", padding: "18px", marginTop: "18px"
  },
  aiResultText: { margin: 0, lineHeight: "1.7", fontSize: "14px", color: "#0D0D0D" }
};

export default ClientDashboard;