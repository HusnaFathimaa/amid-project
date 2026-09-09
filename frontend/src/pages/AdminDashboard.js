import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import logo from "./logo.jpg";

const API = "https://amid-project.onrender.com";
const SECRET = "amid_admin_2024";

function AdminDashboard() {
  const navigate = useNavigate();
  const name = localStorage.getItem("name");
  const [activeTab, setActiveTab] = useState("stats");
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [dresses, setDresses] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchStats();
    fetchUsers();
    fetchDresses();
    fetchBookings();
    // eslint-disable-next-line
  }, []);

  const fetchStats = async () => {
    try {
      const res = await axios.get(`${API}/admin/stats?secret=${SECRET}`);
      setStats(res.data);
    } catch (err) { console.log(err); }
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API}/admin/users?secret=${SECRET}`);
      setUsers(res.data);
    } catch (err) { console.log(err); }
  };

  const fetchDresses = async () => {
    try {
      const res = await axios.get(`${API}/admin/dresses?secret=${SECRET}`);
      setDresses(res.data);
    } catch (err) { console.log(err); }
  };

  const fetchBookings = async () => {
    try {
      const res = await axios.get(`${API}/admin/bookings?secret=${SECRET}`);
      setBookings(res.data);
    } catch (err) { console.log(err); }
  };

  const deleteUser = async (id) => {
    if (window.confirm("Delete this user?")) {
      try {
        await axios.delete(`${API}/admin/users/${id}?secret=${SECRET}`);
        setMessage("User deleted.");
        fetchUsers(); fetchStats();
      } catch (err) { setMessage("Cannot delete — user may have active data."); }
    }
  };

  const deleteDress = async (id) => {
    if (window.confirm("Delete this dress?")) {
      try {
        await axios.delete(`${API}/admin/dresses/${id}?secret=${SECRET}`);
        setMessage("Dress deleted.");
        fetchDresses(); fetchStats();
      } catch (err) { setMessage("Cannot delete dress."); }
    }
  };

  const deleteBooking = async (id) => {
    if (window.confirm("Delete this booking?")) {
      try {
        await axios.delete(`${API}/admin/bookings/${id}?secret=${SECRET}`);
        setMessage("Booking deleted.");
        fetchBookings(); fetchStats();
      } catch (err) { setMessage("Cannot delete booking."); }
    }
  };

  const logout = () => { localStorage.clear(); navigate("/login"); };

  return (
    <div style={s.container}>
      {/* Header */}
      <div style={s.header}>
        <div style={s.logoRow}>
          <img src={logo} alt="AmId" style={s.headerLogo} />
          <div>
            <h2 style={s.logo}>AmId</h2>
            <span style={s.adminBadge}>ADMIN</span>
          </div>
        </div>
        <div style={s.headerRight}>
          <span style={s.welcome}>Welcome, {name}</span>
          <button style={s.logoutBtn} onClick={logout}
            onMouseEnter={e => { e.target.style.background = "#C9A84C"; e.target.style.color = "#0D0D0D"; }}
            onMouseLeave={e => { e.target.style.background = "transparent"; e.target.style.color = "#C9A84C"; }}>
            Logout
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={s.tabBar}>
        {["stats", "users", "dresses", "bookings"].map(tab => (
          <button key={tab} style={activeTab === tab ? s.tabActive : s.tab}
            onClick={() => setActiveTab(tab)}>
            {tab === "stats" ? "📊 Overview" :
             tab === "users" ? `👥 Users (${users.length})` :
             tab === "dresses" ? `👗 Dresses (${dresses.length})` :
             `📋 Bookings (${bookings.length})`}
          </button>
        ))}
      </div>

      <div style={s.body}>
        {message && <div style={s.msgBanner}>{message} <span style={{cursor:"pointer",marginLeft:"12px"}} onClick={() => setMessage("")}>✕</span></div>}

        {/* Stats Tab */}
        {activeTab === "stats" && stats && (
          <div>
            <h3 style={s.sectionTitle}>Platform Overview</h3>
            <div style={s.statsGrid}>
              {[
                { label: "Total Users", value: stats.total_users, color: "#C9A84C" },
                { label: "Vendors", value: stats.total_vendors, color: "#4CAF50" },
                { label: "Clients", value: stats.total_clients, color: "#2196F3" },
                { label: "Total Dresses", value: stats.total_dresses, color: "#9C27B0" },
                { label: "Total Bookings", value: stats.total_bookings, color: "#FF9800" },
                { label: "Approved", value: stats.approved_bookings, color: "#4CAF50" },
                { label: "Pending", value: stats.pending_bookings, color: "#C9A84C" },
                { label: "Rejected", value: stats.rejected_bookings, color: "#EF5350" },
              ].map((stat, i) => (
                <div key={i} style={s.statCard}>
                  <p style={{ ...s.statValue, color: stat.color }}>{stat.value}</p>
                  <p style={s.statLabel}>{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === "users" && (
          <div>
            <h3 style={s.sectionTitle}>All Users</h3>
            <table style={s.table}>
              <thead>
                <tr>
                  {["ID", "Name", "Email", "Role", "Joined", "Action"].map(h => (
                    <th key={h} style={s.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((u, i) => (
                  <tr key={u.id} style={{ background: i % 2 === 0 ? "#FFFFFF" : "#FAF8F4" }}>
                    <td style={s.td}>{u.id}</td>
                    <td style={s.td}>{u.name}</td>
                    <td style={s.td}>{u.email}</td>
                    <td style={s.td}>
                      <span style={{
                        ...s.roleBadge,
                        background: u.role === "vendor" ? "rgba(201,168,76,0.15)" :
                          u.role === "admin" ? "rgba(156,39,176,0.15)" : "rgba(33,150,243,0.15)",
                        color: u.role === "vendor" ? "#C9A84C" :
                          u.role === "admin" ? "#9C27B0" : "#2196F3"
                      }}>{u.role.toUpperCase()}</span>
                    </td>
                    <td style={s.td}>{u.created_at?.slice(0, 10)}</td>
                    <td style={s.td}>
                      {u.role !== "admin" && (
                        <button style={s.delBtn} onClick={() => deleteUser(u.id)}>Delete</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Dresses Tab */}
        {activeTab === "dresses" && (
          <div>
            <h3 style={s.sectionTitle}>All Dresses</h3>
            <table style={s.table}>
              <thead>
                <tr>
                  {["ID", "Name", "Price/Day", "Vendor ID", "Available", "Action"].map(h => (
                    <th key={h} style={s.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {dresses.map((d, i) => (
                  <tr key={d.id} style={{ background: i % 2 === 0 ? "#FFFFFF" : "#FAF8F4" }}>
                    <td style={s.td}>{d.id}</td>
                    <td style={s.td}>{d.name}</td>
                    <td style={s.td}>₹{d.price_per_day}</td>
                    <td style={s.td}>{d.vendor_id}</td>
                    <td style={s.td}>
                      <span style={{ color: d.is_available ? "#4CAF50" : "#EF5350", fontWeight: "700" }}>
                        {d.is_available ? "Yes" : "No"}
                      </span>
                    </td>
                    <td style={s.td}>
                      <button style={s.delBtn} onClick={() => deleteDress(d.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Bookings Tab */}
        {activeTab === "bookings" && (
          <div>
            <h3 style={s.sectionTitle}>All Bookings</h3>
            <table style={s.table}>
              <thead>
                <tr>
                  {["ID", "Dress", "Client", "Dates", "Total", "Status", "Action"].map(h => (
                    <th key={h} style={s.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bookings.map((b, i) => (
                  <tr key={b.booking_id} style={{ background: i % 2 === 0 ? "#FFFFFF" : "#FAF8F4" }}>
                    <td style={s.td}>{b.booking_id}</td>
                    <td style={s.td}>{b.dress_name}</td>
                    <td style={s.td}>{b.client_name}</td>
                    <td style={s.td}>{b.rental_start} → {b.rental_end}</td>
                    <td style={s.td}>₹{b.total_price}</td>
                    <td style={s.td}>
                      <span style={{
                        ...s.roleBadge,
                        background: b.status === "approved" ? "rgba(76,175,80,0.15)" :
                          b.status === "rejected" ? "rgba(239,83,80,0.15)" : "rgba(201,168,76,0.15)",
                        color: b.status === "approved" ? "#4CAF50" :
                          b.status === "rejected" ? "#EF5350" : "#C9A84C"
                      }}>{b.status.toUpperCase()}</span>
                    </td>
                    <td style={s.td}>
                      <button style={s.delBtn} onClick={() => deleteBooking(b.booking_id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

const s = {
  container: { minHeight: "100vh", background: "#FAF8F4", fontFamily: "'Arial', sans-serif" },
  header: {
    background: "#0D0D0D", padding: "16px 32px", display: "flex",
    justifyContent: "space-between", alignItems: "center",
    boxShadow: "0 2px 12px rgba(0,0,0,0.3)"
  },
  logoRow: { display: "flex", alignItems: "center", gap: "12px" },
  headerLogo: { width: "36px", height: "36px", objectFit: "contain" },
  logo: { color: "#C9A84C", margin: "0 0 2px", fontSize: "22px", fontFamily: "'Georgia', serif", letterSpacing: "1px" },
  adminBadge: { fontSize: "10px", color: "#9C27B0", fontWeight: "700", letterSpacing: "2px" },
  headerRight: { display: "flex", alignItems: "center", gap: "20px" },
  welcome: { fontSize: "13px", color: "#AAA" },
  logoutBtn: {
    padding: "8px 18px", background: "transparent", color: "#C9A84C",
    border: "1px solid #C9A84C", borderRadius: "4px", cursor: "pointer",
    fontSize: "12px", letterSpacing: "1px", textTransform: "uppercase",
    fontWeight: "700", transition: "all 0.2s"
  },
  tabBar: { background: "#161616", padding: "0 32px", display: "flex", gap: "4px", borderBottom: "1px solid #2A2A2A", overflowX: "auto" },
  tab: {
    padding: "16px 20px", background: "none", border: "none", borderBottom: "2px solid transparent",
    cursor: "pointer", color: "#888", fontSize: "13px", letterSpacing: "0.5px",
    textTransform: "uppercase", fontWeight: "600", whiteSpace: "nowrap"
  },
  tabActive: {
    padding: "16px 20px", background: "none", border: "none", borderBottom: "2px solid #C9A84C",
    cursor: "pointer", color: "#C9A84C", fontWeight: "700", fontSize: "13px",
    letterSpacing: "0.5px", textTransform: "uppercase", whiteSpace: "nowrap"
  },
  body: { padding: "32px" },
  sectionTitle: { margin: "0 0 24px", fontSize: "20px", color: "#0D0D0D", fontFamily: "'Georgia', serif" },
  msgBanner: {
    background: "rgba(201,168,76,0.1)", border: "1px solid #C9A84C", borderRadius: "4px",
    padding: "12px 20px", marginBottom: "24px", color: "#0D0D0D", fontSize: "13px",
    display: "flex", justifyContent: "space-between"
  },
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "16px" },
  statCard: {
    background: "#FFFFFF", border: "1px solid #EDE7DA", borderRadius: "8px",
    padding: "24px 20px", textAlign: "center"
  },
  statValue: { margin: "0 0 8px", fontSize: "36px", fontWeight: "700", fontFamily: "'Georgia', serif" },
  statLabel: { margin: 0, fontSize: "12px", color: "#888", letterSpacing: "1px", textTransform: "uppercase" },
  table: { width: "100%", borderCollapse: "collapse", background: "#FFFFFF", borderRadius: "6px", overflow: "hidden", border: "1px solid #EDE7DA" },
  th: { padding: "14px 16px", background: "#0D0D0D", color: "#C9A84C", fontSize: "12px", letterSpacing: "1px", textTransform: "uppercase", textAlign: "left", fontWeight: "700" },
  td: { padding: "12px 16px", fontSize: "13px", color: "#333", borderBottom: "1px solid #F0EBE3" },
  roleBadge: { padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "700" },
  delBtn: {
    padding: "5px 12px", background: "transparent", color: "#EF5350",
    border: "1px solid #EF5350", borderRadius: "4px", cursor: "pointer",
    fontSize: "11px", fontWeight: "700", letterSpacing: "0.5px"
  }
};

export default AdminDashboard;