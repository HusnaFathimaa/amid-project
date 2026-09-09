from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models

router = APIRouter(prefix="/admin", tags=["Admin"])

ADMIN_SECRET = "amid_admin_2024"

def verify_admin(secret: str):
    if secret != ADMIN_SECRET:
        raise HTTPException(status_code=403, detail="Unauthorized")

# --- Stats ---
@router.get("/stats")
def get_stats(secret: str, db: Session = Depends(get_db)):
    verify_admin(secret)
    total_users = db.query(models.User).count()
    total_vendors = db.query(models.User).filter(models.User.role == "vendor").count()
    total_clients = db.query(models.User).filter(models.User.role == "client").count()
    total_dresses = db.query(models.Dress).count()
    total_bookings = db.query(models.Booking).count()
    approved = db.query(models.Booking).filter(models.Booking.status == "approved").count()
    pending = db.query(models.Booking).filter(models.Booking.status == "pending").count()
    rejected = db.query(models.Booking).filter(models.Booking.status == "rejected").count()
    return {
        "total_users": total_users,
        "total_vendors": total_vendors,
        "total_clients": total_clients,
        "total_dresses": total_dresses,
        "total_bookings": total_bookings,
        "approved_bookings": approved,
        "pending_bookings": pending,
        "rejected_bookings": rejected,
    }

# --- All Users ---
@router.get("/users")
def get_all_users(secret: str, db: Session = Depends(get_db)):
    verify_admin(secret)
    users = db.query(models.User).all()
    return [{"id": u.id, "name": u.name, "email": u.email, "role": u.role, "created_at": str(u.created_at)} for u in users]

# --- All Dresses ---
@router.get("/dresses")
def get_all_dresses(secret: str, db: Session = Depends(get_db)):
    verify_admin(secret)
    dresses = db.query(models.Dress).all()
    return [{"id": d.id, "name": d.name, "price_per_day": float(d.price_per_day), "vendor_id": d.vendor_id, "is_available": d.is_available} for d in dresses]

# --- All Bookings ---
@router.get("/bookings")
def get_all_bookings(secret: str, db: Session = Depends(get_db)):
    verify_admin(secret)
    bookings = db.query(models.Booking).all()
    result = []
    for b in bookings:
        dress = db.query(models.Dress).filter(models.Dress.id == b.dress_id).first()
        client = db.query(models.User).filter(models.User.id == b.client_id).first()
        result.append({
            "booking_id": b.id,
            "dress_name": dress.name if dress else "Deleted",
            "client_name": client.name if client else "Deleted",
            "client_email": client.email if client else "Deleted",
            "rental_start": str(b.rental_start),
            "rental_end": str(b.rental_end),
            "total_price": float(b.total_price),
            "status": b.status,
        })
    return result

# --- Delete User ---
@router.delete("/users/{user_id}")
def delete_user(user_id: int, secret: str, db: Session = Depends(get_db)):
    verify_admin(secret)
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    db.delete(user)
    db.commit()
    return {"message": f"User {user_id} deleted"}

# --- Delete Dress ---
@router.delete("/dresses/{dress_id}")
def delete_dress(dress_id: int, secret: str, db: Session = Depends(get_db)):
    verify_admin(secret)
    dress = db.query(models.Dress).filter(models.Dress.id == dress_id).first()
    if not dress:
        raise HTTPException(status_code=404, detail="Dress not found")
    db.delete(dress)
    db.commit()
    return {"message": f"Dress {dress_id} deleted"}

# --- Delete Booking ---
@router.delete("/bookings/{booking_id}")
def delete_booking(booking_id: int, secret: str, db: Session = Depends(get_db)):
    verify_admin(secret)
    booking = db.query(models.Booking).filter(models.Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    db.delete(booking)
    db.commit()
    return {"message": f"Booking {booking_id} deleted"}