from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models
from pydantic import BaseModel

router = APIRouter(prefix="/bookings", tags=["Bookings"])

# --- Data shape for creating a booking ---
class BookingData(BaseModel):
    client_id: int
    dress_id: int
    rental_start: str
    rental_end: str
    delivery_address: str
    total_price: float

# --- Client creates a booking ---
@router.post("/create")
def create_booking(data: BookingData, db: Session = Depends(get_db)):
    # Check dress exists and is available
    dress = db.query(models.Dress).filter(models.Dress.id == data.dress_id).first()
    if not dress:
        raise HTTPException(status_code=404, detail="Dress not found")
    if not dress.is_available:
        raise HTTPException(status_code=400, detail="Dress is not available")

    new_booking = models.Booking(
        client_id=data.client_id,
        dress_id=data.dress_id,
        rental_start=data.rental_start,
        rental_end=data.rental_end,
        delivery_address=data.delivery_address,
        total_price=data.total_price,
        status="pending"
    )
    db.add(new_booking)

    # Create notification for vendor
    notification = models.Notification(
        user_id=dress.vendor_id,
        booking_id=None,
        message=f"New booking request for {dress.name}!"
    )
    db.add(notification)
    db.commit()
    db.refresh(new_booking)

    return {"message": "Booking request sent!", "booking_id": new_booking.id}

# --- Vendor sees all bookings for their dresses ---
@router.get("/vendor/{vendor_id}")
def get_vendor_bookings(vendor_id: int, db: Session = Depends(get_db)):
    # Get all dress ids belonging to this vendor
    vendor_dresses = db.query(models.Dress).filter(models.Dress.vendor_id == vendor_id).all()
    dress_ids = [d.id for d in vendor_dresses]

    # Get all bookings for those dresses
    bookings = db.query(models.Booking).filter(models.Booking.dress_id.in_(dress_ids)).all()

    # Return bookings with dress name and client name
    result = []
    for booking in bookings:
        dress = db.query(models.Dress).filter(models.Dress.id == booking.dress_id).first()
        client = db.query(models.User).filter(models.User.id == booking.client_id).first()
        result.append({
            "booking_id": booking.id,
            "dress_name": dress.name,
            "client_name": client.name,
            "client_email": client.email,
            "rental_start": str(booking.rental_start),
            "rental_end": str(booking.rental_end),
            "delivery_address": booking.delivery_address,
            "total_price": float(booking.total_price),
            "status": booking.status
        })
    return result

# --- Vendor approves or rejects a booking ---
@router.put("/update/{booking_id}")
def update_booking(booking_id: int, status: str, db: Session = Depends(get_db)):
    booking = db.query(models.Booking).filter(models.Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    booking.status = status
    db.commit()
    return {"message": f"Booking {status} successfully!"}

# --- Client sees their own bookings ---
@router.get("/client/{client_id}")
def get_client_bookings(client_id: int, db: Session = Depends(get_db)):
    bookings = db.query(models.Booking).filter(models.Booking.client_id == client_id).all()

    result = []
    for booking in bookings:
        dress = db.query(models.Dress).filter(models.Dress.id == booking.dress_id).first()
        result.append({
            "booking_id": booking.id,
            "dress_name": dress.name,
            "dress_image": dress.image_url,
            "rental_start": str(booking.rental_start),
            "rental_end": str(booking.rental_end),
            "total_price": float(booking.total_price),
            "status": booking.status
        })
    return result