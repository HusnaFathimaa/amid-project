import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import logo from "./logo.jpg";

const CATEGORY_META = [
  { name: "Ethnic", icon: "✦", from: "#ff9a9e", to: "#fad0c4" },
  { name: "Party", icon: "✧", from: "#a18cd1", to: "#fbc2eb" },
  { name: "Wedding", icon: "♡", from: "#f6d365", to: "#fda085" },
  { name: "Casual", icon: "◌", from: "#84fab0", to: "#8fd3f4" },
  { name: "Western", icon: "✿", from: "#cfd9df", to: "#e2ebf0" },
];

const PRICE_RANGES = [
  { label: "All Prices", min: 0, max: Infinity },
  { label: "Under ₹500", min: 0, max: 500 },
  { label: "₹500 – ₹1000", min: 500, max: 1000 },
  { label: "₹1000 – ₹1500", min: 1000, max: 1500 },
  { label: "Above ₹1500", min: 1500, max: Infinity },
];

function parseDress(dress) {
  const match = dress.name.match(/^\[(.*?)\]\s*(.*)/);

  if (match) {
    return {
      ...dress,
      category: match[1],
      displayName: match[2],
    };
  }

  return {
    ...dress,
    category: "Western",
    displayName: dress.name,
  };
}

function withDiscount(dress) {
  const originalPrice = Math.round((dress.price_per_day * 1.4) / 10) * 10;
  const percentOff = Math.round(
    ((originalPrice - dress.price_per_day) / originalPrice) * 100
  );

  return { ...dress, originalPrice, percentOff };
}

function formatDate(dateStr) {
  if (!dateStr) return "";

  const d = new Date(dateStr);

  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}


function toDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function fromDateKey(dateKey) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function isDateInRange(dateKey, startKey, endKey) {
  if (!startKey || !endKey) return false;
  return dateKey >= startKey && dateKey <= endKey;
}

function Calendar({
  month,
  setMonth,
  bookedDates,
  rentalStart,
  rentalEnd,
  onSelectDate,
}) {
  const todayKey = toDateKey(new Date());
  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
  const lastDay = new Date(month.getFullYear(), month.getMonth() + 1, 0);
  const firstWeekday = firstDay.getDay();
  const daysInMonth = lastDay.getDate();

  const bookedSet = new Set(
    (bookedDates || []).map((date) => String(date).slice(0, 10))
  );

  const cells = [];
  for (let i = 0; i < firstWeekday; i += 1) {
    cells.push(<div key={`empty-${i}`} className="calendar-empty" />);
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = new Date(month.getFullYear(), month.getMonth(), day);
    const dateKey = toDateKey(date);
    const isBooked = bookedSet.has(dateKey);
    const isPast = dateKey < todayKey;
    const isStart = rentalStart === dateKey;
    const isEnd = rentalEnd === dateKey;
    const isSelectedRange = isDateInRange(dateKey, rentalStart, rentalEnd);

    cells.push(
      <button
        type="button"
        key={dateKey}
        className={`calendar-day ${
          isBooked ? "booked" : ""
        } ${isPast ? "past" : ""} ${isSelectedRange ? "selected-range" : ""} ${
          isStart ? "selected-start" : ""
        } ${isEnd ? "selected-end" : ""}`}
        disabled={isPast}
        onClick={() => onSelectDate(dateKey, isBooked)}
        title={
          isBooked
            ? "Unavailable — already rented by another client"
            : isPast
            ? "Past date"
            : "Available"
        }
      >
        <span>{day}</span>
        {isBooked && <small>Booked</small>}
      </button>
    );
  }

  const monthLabel = month.toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });

  const changeMonth = (offset) => {
    setMonth(
      new Date(month.getFullYear(), month.getMonth() + offset, 1)
    );
  };

  return (
    <div className="calendar-wrap">
      <div className="calendar-header">
        <button
          type="button"
          className="calendar-nav"
          onClick={() => changeMonth(-1)}
          aria-label="Previous month"
        >
          ‹
        </button>

        <div className="calendar-month">{monthLabel}</div>

        <button
          type="button"
          className="calendar-nav"
          onClick={() => changeMonth(1)}
          aria-label="Next month"
        >
          ›
        </button>
      </div>

      <div className="calendar-weekdays">
        {[
          "Sun",
          "Mon",
          "Tue",
          "Wed",
          "Thu",
          "Fri",
          "Sat",
        ].map((day) => (
          <div key={day}>{day}</div>
        ))}
      </div>

      <div className="calendar-grid">{cells}</div>

      <div className="calendar-legend">
        <span>
          <i className="legend-dot available-dot" /> Available
        </span>
        <span>
          <i className="legend-dot booked-dot" /> Unavailable
        </span>
        <span>
          <i className="legend-dot selected-dot" /> Selected
        </span>
      </div>
    </div>
  );
}

function ClientDashboard() {
  const navigate = useNavigate();

  const name = localStorage.getItem("name") || "Fashion Lover";
  const client_id = localStorage.getItem("user_id");

  const [dresses, setDresses] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [activeTab, setActiveTab] = useState("browse");
  const [browseView, setBrowseView] = useState("home");
  const [activeCategory, setActiveCategory] = useState(null);
  const [activePriceRange, setActivePriceRange] = useState(PRICE_RANGES[0]);
  const [selectedDress, setSelectedDress] = useState(null);

  const [bookingForm, setBookingForm] = useState({
    rental_start: "",
    rental_end: "",
    delivery_address: "",
  });

  const [bookedDates, setBookedDates] = useState([]);
  const [calendarMonth, setCalendarMonth] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [message, setMessage] = useState("");

  const [aiQuestion, setAiQuestion] = useState({
    occasion: "",
    budget: "",
    style: "",
  });

  const [aiRecommendation, setAiRecommendation] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    fetchDresses();
    fetchMyBookings();
    // eslint-disable-next-line
  }, []);

  const fetchDresses = async () => {
    try {
      const res = await axios.get(
        "https://amid-project.onrender.com/dresses/all"
      );
      setDresses(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchMyBookings = async () => {
    try {
      const res = await axios.get(
        `https://amid-project.onrender.com/bookings/client/${client_id}`
      );
      setMyBookings(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchBookedDates = async (dress_id) => {
    try {
      const res = await axios.get(
        `https://amid-project.onrender.com/dresses/${dress_id}/booked-dates`
      );
      setBookedDates(res.data.booked_dates);
    } catch (err) {
      console.log(err);
    }
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

  const goToBrowse = () => {
    setActiveTab("browse");
    setBrowseView("home");
  };

  const handleBook = async (dress) => {
    setSelectedDress(dress);
    setMessage("");
    setBookingForm({
      rental_start: "",
      rental_end: "",
      delivery_address: "",
    });
    setCalendarMonth(
      new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    );
    await fetchBookedDates(dress.id);
    setActiveTab("book");
  };

  const handleCalendarDateSelect = (dateKey, isBooked) => {
    if (isBooked) {
      setMessage(
        `Unavailable: ${formatDate(dateKey)} is already rented by another client. Please choose an available date.`
      );
      return;
    }

    setMessage("");

    // First click: choose rental start date.
    if (!bookingForm.rental_start || bookingForm.rental_end) {
      setBookingForm({
        ...bookingForm,
        rental_start: dateKey,
        rental_end: "",
      });
      return;
    }

    // Second click must be after the start date.
    if (dateKey <= bookingForm.rental_start) {
      setBookingForm({
        ...bookingForm,
        rental_start: dateKey,
        rental_end: "",
      });
      return;
    }

    // Do not allow a rental period to cross any unavailable date.
    const start = fromDateKey(bookingForm.rental_start);
    const end = fromDateKey(dateKey);
    const blockedInRange = (bookedDates || []).some((blockedDate) => {
      const blockedKey = String(blockedDate).slice(0, 10);
      return isDateInRange(blockedKey, bookingForm.rental_start, dateKey);
    });

    if (blockedInRange) {
      setMessage(
        "Unavailable: your selected rental period includes a date already rented by another client. Please choose a range containing only available dates."
      );
      return;
    }

    // Keep the variables explicit so the range calculation remains local-date safe.
    void start;
    void end;

    setBookingForm({
      ...bookingForm,
      rental_end: dateKey,
    });
  };

  const calculateTotal = () => {
    if (
      !bookingForm.rental_start ||
      !bookingForm.rental_end ||
      !selectedDress
    ) {
      return 0;
    }

    const start = new Date(bookingForm.rental_start);
    const end = new Date(bookingForm.rental_end);

    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

    return days > 0 ? days * selectedDress.price_per_day : 0;
  };

  const submitBooking = async () => {
    try {
      const total = calculateTotal();

      if (bookingForm.rental_start && bookingForm.rental_end) {
        const overlap = (bookedDates || []).some((blockedDate) =>
          isDateInRange(
            String(blockedDate).slice(0, 10),
            bookingForm.rental_start,
            bookingForm.rental_end
          )
        );

        if (overlap) {
          setMessage(
            "Booking cannot be submitted because the selected dates include an unavailable date. Please choose another range."
          );
          return;
        }
      }

      if (total <= 0) {
        setMessage("Please select valid rental dates.");
        return;
      }

      if (!bookingForm.delivery_address.trim()) {
        setMessage("Please enter your delivery address.");
        return;
      }

      await axios.post("https://amid-project.onrender.com/bookings/create", {
        client_id: parseInt(client_id),
        dress_id: selectedDress.id,
        rental_start: bookingForm.rental_start,
        rental_end: bookingForm.rental_end,
        delivery_address: bookingForm.delivery_address,
        total_price: total,
      });

      setMessage("Booking request sent! Waiting for vendor approval.");

      setBookingForm({
        rental_start: "",
        rental_end: "",
        delivery_address: "",
      });

      fetchMyBookings();

      setTimeout(() => {
        setActiveTab("mybookings");
        setMessage("");
      }, 1800);
    } catch (err) {
      console.log(err);
      setMessage("Booking failed. Please try again.");
    }
  };

  const getAiRecommendation = async () => {
    if (
      !aiQuestion.occasion ||
      !aiQuestion.budget ||
      !aiQuestion.style
    ) {
      setAiRecommendation("Please fill in all 3 fields!");
      return;
    }

    setAiLoading(true);
    setAiRecommendation("");

    try {
      const res = await axios.post(
        "http://127.0.0.1:8000/ai/recommend",
        {
          occasion: aiQuestion.occasion,
          budget: parseFloat(aiQuestion.budget),
          style: aiQuestion.style,
        }
      );

      setAiRecommendation(res.data.recommendation);
    } catch (err) {
      console.log(err);
      setAiRecommendation(
        "AI is unavailable right now. Please try again."
      );
    }

    setAiLoading(false);
  };

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const parsedDresses = dresses.map(parseDress).map(withDiscount);

  const filteredDresses = parsedDresses
    .filter((d) => d.category === activeCategory)
    .filter(
      (d) =>
        d.price_per_day >= activePriceRange.min &&
        d.price_per_day <= activePriceRange.max
    );

  const categoryTiles = CATEGORY_META.map((cat) => {
    const match = parsedDresses.find((d) => d.category === cat.name);

    return {
      ...cat,
      image: match ? match.image_url : null,
    };
  });

  const featuredDresses = parsedDresses.slice(0, 8);

  const renderDressCard = (dress) => (
    <article className="dress-card" key={dress.id}>
      <div className="dress-image-wrap">
        <img
          src={dress.image_url}
          alt={dress.displayName}
          className="dress-image"
          loading="lazy"
        />

        <span className="discount-badge">
          {dress.percentOff}% OFF
        </span>

        <button
          className="quick-heart"
          aria-label="Save dress"
          onClick={(e) => {
            e.stopPropagation();
            e.currentTarget.classList.toggle("liked");
          }}
        >
          ♡
        </button>

        <div className="image-bottom-gradient" />

        <button
          className="quick-book"
          onClick={() => handleBook(dress)}
        >
          BOOK NOW
        </button>
      </div>

      <div className="dress-info">
        <span className="dress-category">{dress.category}</span>

        <h3 className="dress-name">{dress.displayName}</h3>

        <p className="dress-description">
          {dress.description || "Beautifully curated style for your special occasion."}
        </p>

        <div className="price-line">
          <strong>₹{dress.price_per_day}</strong>
          <span>/ day</span>
          <del>₹{dress.originalPrice}</del>
        </div>

        <p className="delivery-line">
          ⚡ Delivery in {dress.delivery_days} days
        </p>
      </div>
    </article>
  );

  return (
    <div className="amid-app">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@500;600;700&display=swap');

        * {
          box-sizing: border-box;
        }

        html {
          scroll-behavior: smooth;
        }

        body {
          margin: 0;
          background: #f7f7f7;
          font-family: "DM Sans", Arial, sans-serif;
          color: #282c3f;
        }

        button,
        input,
        textarea {
          font-family: inherit;
        }

        button {
          -webkit-tap-highlight-color: transparent;
        }

        .amid-app {
          min-height: 100vh;
          background:
            radial-gradient(circle at 10% 0%, rgba(255, 63, 108, 0.04), transparent 24%),
            radial-gradient(circle at 90% 12%, rgba(255, 145, 0, 0.05), transparent 22%),
            #f7f7f7;
        }

        /* TOP NAVIGATION */
        .top-header {
          position: sticky;
          top: 0;
          z-index: 50;
          height: 76px;
          background: rgba(255, 255, 255, 0.97);
          backdrop-filter: blur(18px);
          border-bottom: 1px solid #eeeeee;
          display: flex;
          align-items: center;
          padding: 0 4.5%;
          box-shadow: 0 2px 14px rgba(40, 44, 63, 0.05);
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 190px;
          cursor: pointer;
        }

        .brand-logo {
          width: 42px;
          height: 42px;
          border-radius: 10px;
          object-fit: contain;
          background: #fff;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        }

        .brand-text {
          font-family: "Playfair Display", Georgia, serif;
          font-size: 25px;
          font-weight: 700;
          letter-spacing: -0.5px;
          color: #282c3f;
        }

        .brand-dot {
          color: #ff3f6c;
        }

        .main-nav {
          display: flex;
          align-items: center;
          height: 100%;
          gap: 2px;
        }

        .nav-button {
          position: relative;
          height: 100%;
          border: none;
          background: transparent;
          padding: 0 16px;
          color: #282c3f;
          cursor: pointer;
          text-transform: uppercase;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.6px;
          transition: color 0.2s ease;
        }

        .nav-button:hover,
        .nav-button.active {
          color: #ff3f6c;
        }

        .nav-button.active::after {
          content: "";
          position: absolute;
          bottom: 0;
          left: 15px;
          right: 15px;
          height: 3px;
          border-radius: 3px 3px 0 0;
          background: #ff3f6c;
        }

        .header-spacer {
          flex: 1;
        }

        .welcome-text {
          color: #696e79;
          font-size: 12px;
          margin-right: 14px;
          white-space: nowrap;
        }

        .logout-button {
          border: 1px solid #d9dce2;
          background: #fff;
          color: #282c3f;
          padding: 10px 17px;
          border-radius: 7px;
          cursor: pointer;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.5px;
          transition: all 0.2s ease;
        }

        .logout-button:hover {
          color: #ff3f6c;
          border-color: #ff3f6c;
          transform: translateY(-1px);
        }

        /* CONTENT */
        .page-content {
          width: min(1440px, 94%);
          margin: 0 auto;
          padding: 24px 0 60px;
        }

        /* HERO */
        .hero {
          position: relative;
          min-height: 330px;
          overflow: hidden;
          border-radius: 18px;
          margin-bottom: 28px;
          background:
            linear-gradient(90deg, rgba(23, 23, 31, 0.88) 0%, rgba(23, 23, 31, 0.58) 42%, rgba(23, 23, 31, 0.16) 100%),
            linear-gradient(135deg, #191919, #3d2c34);
          display: flex;
          align-items: center;
          padding: 48px 7%;
          box-shadow: 0 14px 40px rgba(40, 44, 63, 0.13);
        }

        .hero::before {
          content: "";
          position: absolute;
          width: 430px;
          height: 430px;
          right: -100px;
          top: -160px;
          border-radius: 50%;
          background: rgba(255, 63, 108, 0.16);
          filter: blur(4px);
        }

        .hero::after {
          content: "";
          position: absolute;
          width: 280px;
          height: 280px;
          right: 12%;
          bottom: -180px;
          border-radius: 50%;
          background: rgba(255, 179, 0, 0.14);
        }

        .hero-content {
          position: relative;
          z-index: 2;
          max-width: 650px;
        }

        .hero-kicker {
          color: #ffb36b;
          text-transform: uppercase;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 3px;
          margin: 0 0 13px;
        }

        .hero-title {
          margin: 0;
          color: #fff;
          font-family: "Playfair Display", Georgia, serif;
          font-size: clamp(38px, 5vw, 64px);
          line-height: 1.03;
          letter-spacing: -1.8px;
        }

        .hero-title span {
          color: #ff6f91;
        }

        .hero-description {
          max-width: 530px;
          color: rgba(255,255,255,0.78);
          font-size: 14px;
          line-height: 1.7;
          margin: 18px 0 25px;
        }

        .hero-actions {
          display: flex;
          gap: 11px;
          flex-wrap: wrap;
        }

        .primary-button,
        .secondary-button {
          border: none;
          cursor: pointer;
          padding: 13px 22px;
          border-radius: 7px;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.7px;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .primary-button {
          background: #ff3f6c;
          color: #fff;
          box-shadow: 0 8px 20px rgba(255, 63, 108, 0.28);
        }

        .secondary-button {
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.35);
          color: #fff;
        }

        .primary-button:hover,
        .secondary-button:hover {
          transform: translateY(-2px);
        }

        .hero-logo {
          width: 58px;
          height: 58px;
          object-fit: contain;
          background: #fff;
          border-radius: 12px;
          padding: 5px;
          margin-bottom: 18px;
        }

        /* PROMO BANNER */
        .sale-banner {
          min-height: 112px;
          border-radius: 14px;
          margin-bottom: 34px;
          padding: 23px 28px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          overflow: hidden;
          position: relative;
          background:
            linear-gradient(105deg, #fff2f5, #fff9ee 65%, #fff),
            #fff;
          border: 1px solid #f3d8df;
        }

        .sale-banner::after {
          content: "SALE";
          position: absolute;
          right: 18%;
          top: -34px;
          font-size: 110px;
          font-weight: 800;
          color: rgba(255, 63, 108, 0.035);
          pointer-events: none;
        }

        .sale-title {
          margin: 0 0 5px;
          font-family: "Playfair Display", Georgia, serif;
          font-size: 24px;
          color: #282c3f;
        }

        .sale-subtitle {
          margin: 0;
          color: #696e79;
          font-size: 13px;
        }

        .sale-code {
          display: inline-block;
          margin-top: 10px;
          font-size: 11px;
          font-weight: 700;
          color: #ff3f6c;
          letter-spacing: 0.8px;
        }

        .sale-badge {
          position: relative;
          z-index: 2;
          background: #282c3f;
          color: #fff;
          border-radius: 999px;
          padding: 10px 17px;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 1px;
          white-space: nowrap;
        }

        /* SECTION HEADINGS */
        .section-heading-row {
          display: flex;
          justify-content: space-between;
          align-items: end;
          margin: 38px 0 18px;
          gap: 15px;
        }

        .section-title {
          margin: 0;
          font-family: "Playfair Display", Georgia, serif;
          font-size: 27px;
          color: #282c3f;
        }

        .section-subtitle {
          color: #9499a5;
          font-size: 12px;
          margin: 5px 0 0;
        }

        .text-link {
          border: none;
          background: transparent;
          color: #ff3f6c;
          cursor: pointer;
          font-size: 12px;
          font-weight: 700;
          padding: 7px;
        }

        /* CATEGORY CARDS */
        .category-grid {
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          gap: 16px;
        }

        .category-card {
          height: 275px;
          border: none;
          border-radius: 13px;
          overflow: hidden;
          position: relative;
          cursor: pointer;
          background: #ddd;
          box-shadow: 0 6px 20px rgba(40, 44, 63, 0.09);
          transition: transform 0.25s ease, box-shadow 0.25s ease;
          padding: 0;
          text-align: left;
        }

        .category-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 15px 32px rgba(40, 44, 63, 0.16);
        }

        .category-card img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.45s ease;
        }

        .category-card:hover img {
          transform: scale(1.06);
        }

        .category-fallback {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, var(--from), var(--to));
          display: flex;
          justify-content: center;
          align-items: center;
          font-size: 52px;
          color: rgba(255,255,255,0.85);
        }

        .category-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to top,
            rgba(17, 18, 23, 0.85) 0%,
            rgba(17, 18, 23, 0.14) 65%,
            transparent 100%
          );
        }

        .category-content {
          position: absolute;
          z-index: 2;
          bottom: 19px;
          left: 18px;
          right: 18px;
        }

        .category-icon {
          color: #fff;
          font-size: 18px;
          margin-bottom: 6px;
        }

        .category-name {
          margin: 0;
          color: #fff;
          font-family: "Playfair Display", Georgia, serif;
          font-size: 25px;
        }

        .category-shop {
          margin: 5px 0 0;
          color: rgba(255,255,255,0.78);
          font-size: 11px;
          font-weight: 600;
        }

        /* FEATURED PRODUCTS */
        .featured-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 18px;
        }

        .dress-card {
          background: #fff;
          border: 1px solid #eeeeee;
          border-radius: 9px;
          overflow: hidden;
          transition: transform 0.22s ease, box-shadow 0.22s ease;
          min-width: 0;
        }

        .dress-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 32px rgba(40,44,63,0.12);
        }

        .dress-image-wrap {
          position: relative;
          height: 365px;
          overflow: hidden;
          background: #eee;
        }

        .dress-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 0.4s ease;
        }

        .dress-card:hover .dress-image {
          transform: scale(1.035);
        }

        .discount-badge {
          position: absolute;
          top: 12px;
          left: 12px;
          z-index: 3;
          background: #282c3f;
          color: #fff;
          border-radius: 3px;
          padding: 5px 8px;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.4px;
        }

        .quick-heart {
          position: absolute;
          top: 11px;
          right: 11px;
          z-index: 4;
          width: 34px;
          height: 34px;
          border-radius: 50%;
          border: none;
          background: rgba(255,255,255,0.92);
          color: #696e79;
          cursor: pointer;
          font-size: 20px;
          line-height: 1;
          transition: all 0.2s ease;
        }

        .quick-heart:hover,
        .quick-heart.liked {
          color: #ff3f6c;
          transform: scale(1.08);
        }

        .image-bottom-gradient {
          position: absolute;
          left: 0;
          right: 0;
          bottom: 0;
          height: 90px;
          background: linear-gradient(transparent, rgba(0,0,0,0.28));
          pointer-events: none;
        }

        .quick-book {
          position: absolute;
          z-index: 4;
          left: 12px;
          right: 12px;
          bottom: 12px;
          border: none;
          background: rgba(255,255,255,0.95);
          color: #282c3f;
          border-radius: 5px;
          padding: 11px;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 1px;
          cursor: pointer;
          transform: translateY(65px);
          transition: transform 0.25s ease, background 0.2s ease, color 0.2s ease;
        }

        .dress-card:hover .quick-book {
          transform: translateY(0);
        }

        .quick-book:hover {
          background: #ff3f6c;
          color: #fff;
        }

        .dress-info {
          padding: 15px 15px 17px;
        }

        .dress-category {
          color: #9499a5;
          text-transform: uppercase;
          font-size: 10px;
          letter-spacing: 1px;
          font-weight: 700;
        }

        .dress-name {
          color: #282c3f;
          font-size: 15px;
          margin: 5px 0 6px;
          font-weight: 700;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .dress-description {
          color: #696e79;
          font-size: 11px;
          line-height: 1.5;
          margin: 0 0 11px;
          min-height: 33px;
        }

        .price-line {
          display: flex;
          align-items: baseline;
          gap: 5px;
        }

        .price-line strong {
          color: #282c3f;
          font-size: 15px;
        }

        .price-line span {
          color: #696e79;
          font-size: 11px;
        }

        .price-line del {
          color: #9499a5;
          font-size: 11px;
          margin-left: 3px;
        }

        .delivery-line {
          margin: 9px 0 0;
          color: #03a685;
          font-size: 10px;
          font-weight: 600;
        }

        /* CATEGORY VIEW */
        .back-button {
          border: none;
          background: #fff;
          border: 1px solid #e1e3e8;
          color: #282c3f;
          padding: 10px 15px;
          border-radius: 7px;
          cursor: pointer;
          font-size: 12px;
          font-weight: 600;
          margin-bottom: 22px;
        }

        .back-button:hover {
          border-color: #ff3f6c;
          color: #ff3f6c;
        }

        .filter-bar {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          margin-bottom: 25px;
        }

        .filter-chip {
          border: 1px solid #dfe1e6;
          background: #fff;
          color: #535766;
          padding: 9px 15px;
          border-radius: 999px;
          cursor: pointer;
          font-size: 11px;
          font-weight: 600;
          transition: all 0.2s ease;
        }

        .filter-chip:hover {
          border-color: #ff3f6c;
          color: #ff3f6c;
        }

        .filter-chip.active {
          border-color: #ff3f6c;
          background: #ff3f6c;
          color: #fff;
        }

        .result-count {
          color: #9499a5;
          font-family: "DM Sans", Arial, sans-serif;
          font-size: 13px;
          font-weight: 500;
        }

        .dress-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 18px;
        }

        /* PROMO TILES */
        .promo-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 18px;
          margin-top: 30px;
        }

        .promo-tile {
          min-height: 160px;
          border: 1px solid #eee;
          border-radius: 12px;
          padding: 25px;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          background: #fff;
          transition: transform 0.22s ease, box-shadow 0.22s ease;
        }

        .promo-tile:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 28px rgba(40,44,63,0.1);
        }

        .promo-tile.ai {
          background: linear-gradient(135deg, #fff1f5, #fff);
        }

        .promo-tile.booking {
          background: linear-gradient(135deg, #f0fbf8, #fff);
        }

        .promo-symbol {
          font-size: 28px;
          margin-bottom: 8px;
        }

        .promo-tile.ai .promo-symbol {
          color: #ff3f6c;
        }

        .promo-tile.booking .promo-symbol {
          color: #03a685;
        }

        .promo-title {
          margin: 0 0 5px;
          font-family: "Playfair Display", Georgia, serif;
          font-size: 21px;
        }

        .promo-description {
          margin: 0;
          color: #696e79;
          font-size: 12px;
          max-width: 430px;
          line-height: 1.5;
        }

        .promo-arrow {
          position: absolute;
          right: 25px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 28px;
          color: #9499a5;
        }

        /* GENERAL CARD */
        .panel {
          background: #fff;
          border: 1px solid #e9e9e9;
          border-radius: 13px;
          padding: 28px;
          box-shadow: 0 6px 20px rgba(40,44,63,0.05);
        }

        .panel-title {
          margin: 0 0 7px;
          font-family: "Playfair Display", Georgia, serif;
          font-size: 27px;
          color: #282c3f;
        }

        .panel-subtitle {
          color: #696e79;
          font-size: 13px;
          line-height: 1.6;
          margin: 0 0 23px;
        }

        /* BOOKING */
        .booking-layout {
          display: grid;
          grid-template-columns: minmax(260px, 0.8fr) minmax(350px, 1.2fr);
          gap: 28px;
          align-items: start;
        }

        .booking-product {
          position: sticky;
          top: 95px;
          background: #fff;
          border: 1px solid #e9e9e9;
          border-radius: 13px;
          overflow: hidden;
          box-shadow: 0 6px 20px rgba(40,44,63,0.05);
        }

        .booking-product-image {
          width: 100%;
          height: 470px;
          object-fit: cover;
          display: block;
        }

        .booking-product-info {
          padding: 19px;
        }

        .booking-product-category {
          color: #ff3f6c;
          text-transform: uppercase;
          letter-spacing: 1px;
          font-size: 10px;
          font-weight: 700;
        }

        .booking-product-name {
          margin: 5px 0 8px;
          font-family: "Playfair Display", Georgia, serif;
          font-size: 23px;
        }

        .booking-price {
          font-size: 18px;
          font-weight: 700;
        }

        .booking-price small {
          color: #696e79;
          font-size: 11px;
          font-weight: 400;
        }

        .form-panel {
          background: #fff;
          border: 1px solid #e9e9e9;
          border-radius: 13px;
          padding: 28px;
        }

        .calendar-wrap {
          border: 1px solid #ececf0;
          border-radius: 14px;
          background: #fff;
          padding: 14px;
          margin: -4px 0 16px;
          box-shadow: 0 8px 25px rgba(40, 44, 63, 0.04);
        }

        .calendar-header {
          display: grid;
          grid-template-columns: 38px 1fr 38px;
          align-items: center;
          gap: 8px;
          margin-bottom: 13px;
        }

        .calendar-month {
          text-align: center;
          font-family: "Playfair Display", Georgia, serif;
          font-size: 18px;
          font-weight: 700;
          color: #282c3f;
        }

        .calendar-nav {
          width: 36px;
          height: 36px;
          border: 1px solid #e2e2e7;
          background: #fff;
          color: #282c3f;
          border-radius: 50%;
          cursor: pointer;
          font-size: 23px;
          line-height: 1;
          transition: all 0.18s ease;
        }

        .calendar-nav:hover {
          border-color: #ff3f6c;
          color: #ff3f6c;
          transform: translateY(-1px);
        }

        .calendar-weekdays,
        .calendar-grid {
          display: grid;
          grid-template-columns: repeat(7, minmax(0, 1fr));
          gap: 5px;
        }

        .calendar-weekdays {
          margin-bottom: 6px;
        }

        .calendar-weekdays div {
          text-align: center;
          color: #94969f;
          font-size: 10px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          padding: 4px 0;
        }

        .calendar-empty {
          min-height: 43px;
        }

        .calendar-day {
          min-height: 43px;
          border: 1px solid transparent;
          border-radius: 9px;
          background: #fff;
          color: #282c3f;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 1px;
          font-size: 12px;
          font-weight: 700;
          transition: all 0.16s ease;
          position: relative;
        }

        .calendar-day:hover:not(:disabled):not(.booked) {
          border-color: #ff3f6c;
          color: #ff3f6c;
          background: #fff5f7;
          transform: translateY(-1px);
        }

        .calendar-day.past,
        .calendar-day:disabled:not(.booked) {
          color: #c7c8cc;
          background: #fafafa;
          cursor: not-allowed;
        }

        .calendar-day.booked {
          background: #fff0f2;
          border: 1px solid #ffb8c5;
          color: #e11d48;
          cursor: not-allowed;
          text-decoration: line-through;
        }

        .calendar-day.booked:hover {
          background: #ffe4e8;
        }

        .calendar-day.booked small {
          font-size: 7px;
          font-weight: 800;
          text-decoration: none;
          letter-spacing: 0.2px;
        }

        .calendar-day.selected-range {
          background: #fff0f5;
          border-color: #ffb5c5;
        }

        .calendar-day.selected-start,
        .calendar-day.selected-end {
          background: #ff3f6c;
          color: #fff;
          border-color: #ff3f6c;
          text-decoration: none;
        }

        .calendar-legend {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-top: 13px;
          padding-top: 11px;
          border-top: 1px solid #f0f0f2;
          color: #696e79;
          font-size: 10px;
          font-weight: 600;
        }

        .calendar-legend span {
          display: inline-flex;
          align-items: center;
          gap: 5px;
        }

        .legend-dot {
          width: 9px;
          height: 9px;
          border-radius: 50%;
          display: inline-block;
          border: 1px solid #ddd;
        }

        .available-dot {
          background: #fff;
        }

        .booked-dot {
          background: #ffb8c5;
          border-color: #ff8097;
        }

        .selected-dot {
          background: #ff3f6c;
          border-color: #ff3f6c;
        }

        .date-selection-summary {
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          align-items: center;
          gap: 10px;
          margin: -2px 0 12px;
          padding: 12px;
          border-radius: 10px;
          background: linear-gradient(135deg, #fff7f9, #fffaf3);
          border: 1px solid #f3e1e5;
        }

        .date-selection-summary div:not(.date-arrow) {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .date-selection-summary span {
          color: #989aa2;
          font-size: 8px;
          font-weight: 800;
          letter-spacing: 0.8px;
        }

        .date-selection-summary strong {
          color: #282c3f;
          font-size: 12px;
        }

        .date-arrow {
          color: #ff3f6c;
          font-size: 17px;
          font-weight: 800;
        }

        .booked-hint-red {
          background: #fff4f5;
          border-color: #ffc6cf;
          color: #c81e3a;
        }

        .form-label {
          display: block;
          color: #535766;
          text-transform: uppercase;
          letter-spacing: 0.7px;
          font-size: 10px;
          font-weight: 700;
          margin: 0 0 7px;
        }

        .form-input,
        .form-textarea {
          width: 100%;
          border: 1px solid #dfe1e6;
          background: #fff;
          color: #282c3f;
          border-radius: 6px;
          padding: 13px 14px;
          font-size: 13px;
          outline: none;
          margin-bottom: 19px;
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        .form-input:focus,
        .form-textarea:focus {
          border-color: #ff3f6c;
          box-shadow: 0 0 0 3px rgba(255,63,108,0.08);
        }

        .form-textarea {
          min-height: 105px;
          resize: vertical;
        }

        .total-box {
          background: linear-gradient(135deg, #fff3f6, #fff9ed);
          border: 1px solid #f5dce2;
          border-radius: 9px;
          padding: 16px;
          margin: 3px 0 18px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .total-label {
          color: #696e79;
          font-size: 12px;
        }

        .total-value {
          color: #282c3f;
          font-size: 20px;
          font-weight: 800;
        }

        .confirm-button {
          width: 100%;
          border: none;
          background: #ff3f6c;
          color: #fff;
          padding: 14px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 1px;
          transition: all 0.2s ease;
        }

        .confirm-button:hover {
          background: #e73560;
          transform: translateY(-1px);
        }

        .message {
          padding: 11px 13px;
          background: #fff4f6;
          color: #ff3f6c;
          border: 1px solid #f3d7de;
          border-radius: 6px;
          font-size: 12px;
          margin: 0 0 15px;
        }

        .booked-hint {
          background: #fff8eb;
          border: 1px solid #f4dfb6;
          color: #a76b00;
          border-radius: 6px;
          padding: 10px 12px;
          margin: -5px 0 17px;
          font-size: 11px;
          line-height: 1.5;
        }

        .form-actions {
          display: flex;
          gap: 10px;
        }

        .form-back {
          border: 1px solid #dfe1e6;
          background: #fff;
          color: #535766;
          padding: 13px 20px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 11px;
          font-weight: 700;
        }

        /* BOOKINGS */
        .booking-list {
          display: grid;
          gap: 15px;
        }

        .booking-card {
          background: #fff;
          border: 1px solid #e9e9e9;
          border-radius: 11px;
          padding: 16px;
          box-shadow: 0 4px 15px rgba(40,44,63,0.04);
        }

        .booking-row {
          display: flex;
          gap: 17px;
          align-items: center;
        }

        .booking-img {
          width: 90px;
          height: 105px;
          object-fit: cover;
          border-radius: 7px;
          flex-shrink: 0;
        }

        .booking-details {
          flex: 1;
          min-width: 0;
        }

        .booking-dress {
          margin: 0 0 8px;
          font-family: "Playfair Display", Georgia, serif;
          font-size: 19px;
          color: #282c3f;
        }

        .booking-meta {
          margin: 0 0 5px;
          color: #696e79;
          font-size: 12px;
        }

        .status-badge {
          padding: 7px 12px;
          border-radius: 999px;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 0.7px;
          white-space: nowrap;
        }

        .success-panel {
          margin-top: 15px;
          border: 1px solid #bfe9dc;
          background: #f1fbf8;
          border-radius: 8px;
          padding: 15px;
        }

        .success-title {
          margin: 0 0 9px;
          color: #03a685;
          font-weight: 800;
          font-size: 13px;
        }

        .success-row {
          margin: 0 0 5px;
          color: #535766;
          font-size: 12px;
        }

        .success-label {
          color: #282c3f;
          font-weight: 700;
        }

        .success-note {
          margin: 9px 0 0;
          color: #696e79;
          font-size: 11px;
          line-height: 1.55;
        }

        /* AI STYLIST */
        .ai-page {
          display: grid;
          grid-template-columns: 0.9fr 1.1fr;
          gap: 24px;
          align-items: stretch;
        }

        .ai-intro-card {
          min-height: 530px;
          border-radius: 15px;
          padding: 40px;
          color: #fff;
          position: relative;
          overflow: hidden;
          background:
            radial-gradient(circle at 85% 18%, rgba(255,255,255,0.2), transparent 22%),
            linear-gradient(145deg, #ff3f6c, #b72e72);
          box-shadow: 0 14px 35px rgba(255,63,108,0.2);
        }

        .ai-intro-card::after {
          content: "✦";
          position: absolute;
          right: 50px;
          bottom: 15px;
          font-size: 180px;
          line-height: 1;
          color: rgba(255,255,255,0.08);
        }

        .ai-small {
          margin: 0 0 13px;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 2.5px;
          text-transform: uppercase;
        }

        .ai-title {
          margin: 0;
          font-family: "Playfair Display", Georgia, serif;
          font-size: 48px;
          line-height: 1.05;
          position: relative;
          z-index: 2;
        }

        .ai-copy {
          position: relative;
          z-index: 2;
          color: rgba(255,255,255,0.82);
          line-height: 1.7;
          font-size: 13px;
          max-width: 410px;
          margin-top: 18px;
        }

        .ai-steps {
          position: relative;
          z-index: 2;
          margin-top: 32px;
          display: grid;
          gap: 12px;
        }

        .ai-step {
          display: flex;
          align-items: center;
          gap: 11px;
          font-size: 12px;
          color: rgba(255,255,255,0.92);
        }

        .ai-step-number {
          width: 27px;
          height: 27px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          background: rgba(255,255,255,0.18);
          font-size: 10px;
          font-weight: 800;
        }

        .ai-form-card {
          background: #fff;
          border: 1px solid #e9e9e9;
          border-radius: 15px;
          padding: 32px;
          box-shadow: 0 6px 20px rgba(40,44,63,0.05);
        }

        .ai-form-title {
          margin: 0 0 5px;
          font-family: "Playfair Display", Georgia, serif;
          font-size: 27px;
        }

        .ai-form-subtitle {
          color: #696e79;
          font-size: 12px;
          margin: 0 0 25px;
        }

        .ai-result {
          margin-top: 18px;
          border: 1px solid #f2d7df;
          background: #fff7f9;
          border-radius: 9px;
          padding: 18px;
        }

        .ai-result-title {
          color: #ff3f6c;
          margin: 0 0 8px;
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .ai-result-text {
          color: #282c3f;
          margin: 0;
          font-size: 13px;
          line-height: 1.7;
          white-space: pre-wrap;
        }

        /* EMPTY */
        .empty-state {
          text-align: center;
          padding: 70px 20px;
          background: #fff;
          border: 1px dashed #dfe1e6;
          border-radius: 12px;
          color: #9499a5;
        }

        .empty-icon {
          font-size: 40px;
          margin-bottom: 12px;
        }

        .empty-state p {
          margin: 0;
          font-size: 13px;
        }

        /* FOOTER */
        .footer {
          margin-top: 55px;
          background: #282c3f;
          color: #fff;
          padding: 35px 5%;
          border-radius: 14px 14px 0 0;
          display: flex;
          justify-content: space-between;
          gap: 25px;
          align-items: center;
        }

        .footer-brand {
          font-family: "Playfair Display", Georgia, serif;
          font-size: 22px;
        }

        .footer-copy {
          margin: 5px 0 0;
          color: #a9adba;
          font-size: 11px;
        }

        .footer-links {
          display: flex;
          gap: 18px;
          color: #c8cad1;
          font-size: 11px;
        }

        /* RESPONSIVE */
        @media (max-width: 1100px) {
          .category-grid {
            grid-template-columns: repeat(3, 1fr);
          }

          .featured-grid,
          .dress-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }

          .brand {
            min-width: auto;
          }

          .welcome-text {
            display: none;
          }
        }

        @media (max-width: 820px) {
          .top-header {
            height: auto;
            min-height: 70px;
            padding: 10px 4%;
            flex-wrap: wrap;
          }

          .brand {
            flex: 1;
          }

          .main-nav {
            order: 3;
            width: 100%;
            height: 45px;
            overflow-x: auto;
          }

          .nav-button {
            height: 45px;
            padding: 0 12px;
          }

          .page-content {
            width: 92%;
          }

          .hero {
            min-height: 400px;
            padding: 38px 7%;
          }

          .category-grid,
          .featured-grid,
          .dress-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .booking-layout,
          .ai-page {
            grid-template-columns: 1fr;
          }

          .booking-product {
            position: static;
          }

          .booking-product-image {
            height: 390px;
          }

          .ai-intro-card {
            min-height: 350px;
          }
        }

        @media (max-width: 560px) {
          .brand-text {
            font-size: 21px;
          }

          .logout-button {
            padding: 8px 11px;
          }

          .hero {
            border-radius: 12px;
            min-height: 420px;
          }

          .hero-title {
            font-size: 38px;
          }

          .sale-banner {
            align-items: flex-start;
            gap: 18px;
            flex-direction: column;
          }

          .category-grid,
          .featured-grid,
          .dress-grid,
          .promo-grid {
            grid-template-columns: 1fr;
          }

          .category-card {
            height: 330px;
          }

          .dress-image-wrap {
            height: 430px;
          }

          .quick-book {
            transform: translateY(0);
          }

          .booking-row {
            align-items: flex-start;
          }

          .booking-img {
            width: 72px;
            height: 88px;
          }

          .status-badge {
            align-self: flex-start;
          }

          .booking-dress {
            font-size: 16px;
          }

          .form-panel,
          .ai-form-card,
          .panel {
            padding: 21px;
          }

          .ai-intro-card {
            padding: 28px;
          }

          .ai-title {
            font-size: 40px;
          }

          .footer {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>

      <header className="top-header">
        <div
          className="brand"
          onClick={goToBrowse}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && goToBrowse()}
        >
          <img src={logo} alt="AmId" className="brand-logo" />
          <div className="brand-text">
            AmId<span className="brand-dot">.</span>
          </div>
        </div>

        <nav className="main-nav">
          <button
            className={`nav-button ${
              activeTab === "browse" ? "active" : ""
            }`}
            onClick={() => {
              setActiveTab("browse");
              setBrowseView("home");
            }}
          >
            Browse
          </button>

          <button
            className={`nav-button ${
              activeTab === "mybookings" ? "active" : ""
            }`}
            onClick={() => setActiveTab("mybookings")}
          >
            My Bookings ({myBookings.length})
          </button>

          <button
            className={`nav-button ${activeTab === "ai" ? "active" : ""}`}
            onClick={() => setActiveTab("ai")}
          >
            AI Stylist
          </button>
        </nav>

        <div className="header-spacer" />

        <span className="welcome-text">Hi, {name}</span>

        <button className="logout-button" onClick={logout}>
          Logout
        </button>
      </header>

      <main className="page-content">
        {/* HOME */}
        {activeTab === "browse" && browseView === "home" && (
          <>
            <section className="hero">
              <div className="hero-content">
                <img src={logo} alt="AmId" className="hero-logo" />

                <p className="hero-kicker">Rent • Wear • Return</p>

                <h1 className="hero-title">
                  Your next <span>iconic look</span> starts here.
                </h1>

                <p className="hero-description">
                  Discover statement dresses for weddings, parties,
                  festivals and everyday moments. Pick your look, rent it,
                  wear it, and make the moment yours.
                </p>

                <div className="hero-actions">
                  <button
                    className="primary-button"
                    onClick={() => {
                      document
                        .getElementById("featured-dresses")
                        ?.scrollIntoView({ behavior: "smooth" });
                    }}
                  >
                    EXPLORE DRESSES
                  </button>

                  <button
                    className="secondary-button"
                    onClick={() => setActiveTab("ai")}
                  >
                    ✦ TRY AI STYLIST
                  </button>
                </div>
              </div>
            </section>

            <section className="sale-banner">
              <div>
                <h2 className="sale-title">Festive Rental Edit</h2>
                <p className="sale-subtitle">
                  Up to 40% off selected styles — because great outfits
                  should not cost a fortune.
                </p>
                <span className="sale-code">
                  EXTRA 20% OFF • CODE: AMID20
                </span>
              </div>

              <span className="sale-badge">LIMITED TIME</span>
            </section>

            <section>
              <div className="section-heading-row">
                <div>
                  <h2 className="section-title">Shop by category</h2>
                  <p className="section-subtitle">
                    Find the mood. Then find the dress.
                  </p>
                </div>
              </div>

              <div className="category-grid">
                {categoryTiles.map((tile) => (
                  <button
                    key={tile.name}
                    className="category-card"
                    style={{
                      "--from": tile.from,
                      "--to": tile.to,
                    }}
                    onClick={() => openCategory(tile.name)}
                  >
                    {tile.image ? (
                      <img src={tile.image} alt={tile.name} />
                    ) : (
                      <div className="category-fallback">
                        {tile.icon}
                      </div>
                    )}

                    <div className="category-overlay" />

                    <div className="category-content">
                      <div className="category-icon">{tile.icon}</div>
                      <h3 className="category-name">{tile.name}</h3>
                      <p className="category-shop">SHOP NOW →</p>
                    </div>
                  </button>
                ))}
              </div>
            </section>

            <section id="featured-dresses">
              <div className="section-heading-row">
                <div>
                  <h2 className="section-title">Trending right now</h2>
                  <p className="section-subtitle">
                    Fresh looks picked from the AmId collection.
                  </p>
                </div>

                <button
                  className="text-link"
                  onClick={() => openCategory("Western")}
                >
                  VIEW ALL →
                </button>
              </div>

              {featuredDresses.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">♡</div>
                  <p>Loading your fashion collection...</p>
                </div>
              ) : (
                <div className="featured-grid">
                  {featuredDresses.map(renderDressCard)}
                </div>
              )}
            </section>

            <section className="promo-grid">
              <div
                className="promo-tile ai"
                onClick={() => setActiveTab("ai")}
              >
                <div className="promo-symbol">✦</div>
                <h3 className="promo-title">Meet your AI stylist</h3>
                <p className="promo-description">
                  Tell us your occasion, budget and vibe. Let AmId suggest
                  the look.
                </p>
                <div className="promo-arrow">→</div>
              </div>

              <div
                className="promo-tile booking"
                onClick={() => setActiveTab("mybookings")}
              >
                <div className="promo-symbol">✓</div>
                <h3 className="promo-title">Your rentals, organised</h3>
                <p className="promo-description">
                  Track your booking status, delivery dates and approved
                  rentals in one place.
                </p>
                <div className="promo-arrow">→</div>
              </div>
            </section>
          </>
        )}

        {/* CATEGORY */}
        {activeTab === "browse" && browseView === "category" && (
          <>
            <button className="back-button" onClick={backToHome}>
              ← Back to categories
            </button>

            <div className="section-heading-row">
              <div>
                <h2 className="section-title">
                  {activeCategory} edit{" "}
                  <span className="result-count">
                    ({filteredDresses.length})
                  </span>
                </h2>

                <p className="section-subtitle">
                  Curated {activeCategory?.toLowerCase()} styles for you.
                </p>
              </div>
            </div>

            <div className="filter-bar">
              {PRICE_RANGES.map((range) => (
                <button
                  key={range.label}
                  className={`filter-chip ${
                    activePriceRange.label === range.label ? "active" : ""
                  }`}
                  onClick={() => setActivePriceRange(range)}
                >
                  {range.label}
                </button>
              ))}
            </div>

            {filteredDresses.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">✦</div>
                <p>No dresses available in this price range yet.</p>
              </div>
            ) : (
              <div className="dress-grid">
                {filteredDresses.map(renderDressCard)}
              </div>
            )}
          </>
        )}

        {/* BOOKING */}
        {activeTab === "book" && selectedDress && (
          <div>
            <button
              className="back-button"
              onClick={() => {
                setActiveTab("browse");
                setBrowseView("category");
              }}
            >
              ← Back to dresses
            </button>

            <div className="booking-layout">
              <div className="booking-product">
                <img
                  src={selectedDress.image_url}
                  alt={selectedDress.name}
                  className="booking-product-image"
                />

                <div className="booking-product-info">
                  <span className="booking-product-category">
                    {selectedDress.category}
                  </span>

                  <h2 className="booking-product-name">
                    {selectedDress.displayName || selectedDress.name}
                  </h2>

                  <div className="booking-price">
                    ₹{selectedDress.price_per_day}
                    <small> / day</small>
                  </div>
                </div>
              </div>

              <div className="form-panel">
                <h2 className="panel-title">Reserve your look</h2>

                <p className="panel-subtitle">
                  Choose your rental dates and delivery address. Your
                  request will be sent to the vendor for approval.
                </p>

                <label className="form-label">Rental dates</label>

                <div className="date-selection-summary">
                  <div>
                    <span>START</span>
                    <strong>
                      {bookingForm.rental_start
                        ? formatDate(bookingForm.rental_start)
                        : "Select start"}
                    </strong>
                  </div>
                  <div className="date-arrow">→</div>
                  <div>
                    <span>END</span>
                    <strong>
                      {bookingForm.rental_end
                        ? formatDate(bookingForm.rental_end)
                        : "Select end"}
                    </strong>
                  </div>
                </div>

                <Calendar
                  month={calendarMonth}
                  setMonth={setCalendarMonth}
                  bookedDates={bookedDates}
                  rentalStart={bookingForm.rental_start}
                  rentalEnd={bookingForm.rental_end}
                  onSelectDate={handleCalendarDateSelect}
                />

                {bookedDates.length > 0 ? (
                  <div className="booked-hint booked-hint-red">
                    <strong>🔴 Unavailable dates are shown in red.</strong>
                    <br />
                    These dates are already rented by another client and cannot
                    be selected. Your rental period also cannot pass through a
                    red date.
                  </div>
                ) : (
                  <div className="booked-hint">
                    All dates currently shown are available. If another client
                    books this dress before you confirm, the server will reject
                    the conflicting request.
                  </div>
                )}

                <label className="form-label">Delivery address</label>

                <textarea
                  className="form-textarea"
                  placeholder="Enter your full delivery address"
                  value={bookingForm.delivery_address}
                  onChange={(e) =>
                    setBookingForm({
                      ...bookingForm,
                      delivery_address: e.target.value,
                    })
                  }
                />

                {calculateTotal() > 0 && (
                  <div className="total-box">
                    <span className="total-label">
                      Estimated rental total
                    </span>

                    <span className="total-value">
                      ₹{calculateTotal()}
                    </span>
                  </div>
                )}

                {message && <p className="message">{message}</p>}

                <div className="form-actions">
                  <button
                    className="form-back"
                    onClick={() => {
                      setActiveTab("browse");
                      setBrowseView("category");
                    }}
                  >
                    Back
                  </button>

                  <button
                    className="confirm-button"
                    onClick={submitBooking}
                  >
                    CONFIRM BOOKING
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* BOOKINGS */}
        {activeTab === "mybookings" && (
          <div className="panel">
            <h2 className="panel-title">My bookings</h2>

            <p className="panel-subtitle">
              Keep track of your AmId rentals from request to return.
            </p>

            {myBookings.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">♡</div>
                <p>You haven't booked a dress yet.</p>

                <button
                  className="primary-button"
                  style={{ marginTop: 18 }}
                  onClick={goToBrowse}
                >
                  START SHOPPING
                </button>
              </div>
            ) : (
              <div className="booking-list">
                {myBookings.map((booking) => (
                  <div
                    key={booking.booking_id}
                    className="booking-card"
                  >
                    <div className="booking-row">
                      <img
                        src={booking.dress_image}
                        alt={booking.dress_name}
                        className="booking-img"
                      />

                      <div className="booking-details">
                        <h3 className="booking-dress">
                          {booking.dress_name}
                        </h3>

                        <p className="booking-meta">
                          {formatDate(booking.rental_start)} →{" "}
                          {formatDate(booking.rental_end)}
                        </p>

                        <p className="booking-meta">
                          Total: ₹{booking.total_price}
                        </p>
                      </div>

                      <span
                        className="status-badge"
                        style={{
                          background:
                            booking.status === "approved"
                              ? "#e8f8f3"
                              : booking.status === "rejected"
                              ? "#fff0f1"
                              : "#fff7e7",
                          color:
                            booking.status === "approved"
                              ? "#03a685"
                              : booking.status === "rejected"
                              ? "#ff3f6c"
                              : "#c47a00",
                        }}
                      >
                        {booking.status.toUpperCase()}
                      </span>
                    </div>

                    {booking.status === "approved" && (
                      <div className="success-panel">
                        <p className="success-title">
                          ✓ Booking confirmed
                        </p>

                        <p className="success-row">
                          <span className="success-label">
                            Delivery date:
                          </span>{" "}
                          {formatDate(booking.rental_start)}
                        </p>

                        <p className="success-row">
                          <span className="success-label">
                            Return pickup:
                          </span>{" "}
                          {formatDate(booking.rental_end)}
                        </p>

                        <p className="success-note">
                          Our delivery partner will drop off your dress
                          on the delivery date and collect it for return
                          on the pickup date. Please have it ready.
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* AI STYLIST */}
        {activeTab === "ai" && (
          <div className="ai-page">
            <section className="ai-intro-card">
              <p className="ai-small">AmId Intelligence</p>

              <h1 className="ai-title">
                Your style.
                <br />
                Your rules.
              </h1>

              <p className="ai-copy">
                Finding the right dress should feel exciting, not
                overwhelming. Give our AI stylist three little clues and
                let it narrow down the look for you.
              </p>

              <div className="ai-steps">
                <div className="ai-step">
                  <span className="ai-step-number">01</span>
                  Tell us the occasion
                </div>

                <div className="ai-step">
                  <span className="ai-step-number">02</span>
                  Set your budget
                </div>

                <div className="ai-step">
                  <span className="ai-step-number">03</span>
                  Describe your vibe
                </div>
              </div>
            </section>

            <section className="ai-form-card">
              <h2 className="ai-form-title">Find your perfect look</h2>

              <p className="ai-form-subtitle">
                Answer three quick questions.
              </p>

              <label className="form-label">What's the occasion?</label>

              <input
                className="form-input"
                placeholder="e.g. wedding, birthday, festival"
                value={aiQuestion.occasion}
                onChange={(e) =>
                  setAiQuestion({
                    ...aiQuestion,
                    occasion: e.target.value,
                  })
                }
              />

              <label className="form-label">Budget per day (₹)</label>

              <input
                className="form-input"
                type="number"
                min="0"
                placeholder="e.g. 2000"
                value={aiQuestion.budget}
                onChange={(e) =>
                  setAiQuestion({
                    ...aiQuestion,
                    budget: e.target.value,
                  })
                }
              />

              <label className="form-label">Style preference</label>

              <input
                className="form-input"
                placeholder="e.g. traditional, modern, elegant"
                value={aiQuestion.style}
                onChange={(e) =>
                  setAiQuestion({
                    ...aiQuestion,
                    style: e.target.value,
                  })
                }
              />

              <button
                className="confirm-button"
                onClick={getAiRecommendation}
                disabled={aiLoading}
                style={{
                  opacity: aiLoading ? 0.75 : 1,
                  cursor: aiLoading ? "wait" : "pointer",
                }}
              >
                {aiLoading
                  ? "FINDING YOUR LOOK..."
                  : "GET AI RECOMMENDATION"}
              </button>

              {aiRecommendation && (
                <div className="ai-result">
                  <p className="ai-result-title">
                    ✦ Your AmId recommendation
                  </p>

                  <p className="ai-result-text">
                    {aiRecommendation}
                  </p>
                </div>
              )}
            </section>
          </div>
        )}
      </main>

      <footer className="footer">
        <div>
          <div className="footer-brand">AmId.</div>
          <p className="footer-copy">
            Rent the look. Own the moment.
          </p>
        </div>

        <div className="footer-links">
          <span>Fashion rentals</span>
          <span>AI stylist</span>
          <span>Easy returns</span>
        </div>
      </footer>
    </div>
  );
}

export default ClientDashboard;
