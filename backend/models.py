from sqlalchemy import Column, Integer, String, Boolean, Numeric, Date, DateTime, ForeignKey, Text
from sqlalchemy.sql import func
from database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    email = Column(String, unique=True)
    password_hash = Column(String)
    role = Column(String)
    created_at = Column(DateTime, default=func.now())

class Dress(Base):
    __tablename__ = "dresses"
    id = Column(Integer, primary_key=True, index=True)
    vendor_id = Column(Integer, ForeignKey("users.id"))
    name = Column(String)
    description = Column(Text)
    price_per_day = Column(Numeric)
    delivery_days = Column(Integer)
    image_url = Column(String)
    is_available = Column(Boolean, default=True)
    created_at = Column(DateTime, default=func.now())

class Booking(Base):
    __tablename__ = "bookings"
    id = Column(Integer, primary_key=True, index=True)
    client_id = Column(Integer, ForeignKey("users.id"))
    dress_id = Column(Integer, ForeignKey("dresses.id"))
    rental_start = Column(Date)
    rental_end = Column(Date)
    delivery_address = Column(Text)
    total_price = Column(Numeric)
    status = Column(String, default="pending")
    created_at = Column(DateTime, default=func.now())

class Notification(Base):
    __tablename__ = "notifications"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    booking_id = Column(Integer, ForeignKey("bookings.id"))
    message = Column(Text)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=func.now())