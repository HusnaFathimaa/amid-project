from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models
from pydantic import BaseModel
from typing import Optional

router = APIRouter(prefix="/dresses", tags=["Dresses"])

# --- Data shape for uploading a dress ---
class DressData(BaseModel):
    name: str
    description: str
    price_per_day: float
    delivery_days: int
    image_url: str
    vendor_id: int

# --- Vendor uploads a dress ---
@router.post("/upload")
def upload_dress(data: DressData, db: Session = Depends(get_db)):
    new_dress = models.Dress(
        vendor_id=data.vendor_id,
        name=data.name,
        description=data.description,
        price_per_day=data.price_per_day,
        delivery_days=data.delivery_days,
        image_url=data.image_url,
        is_available=True
    )
    db.add(new_dress)
    db.commit()
    db.refresh(new_dress)
    return {"message": "Dress uploaded successfully!", "dress_id": new_dress.id}

# --- Anyone can fetch all available dresses ---
@router.get("/all")
def get_all_dresses(db: Session = Depends(get_db)):
    dresses = db.query(models.Dress).filter(models.Dress.is_available == True).all()
    return dresses

# --- Fetch dresses uploaded by a specific vendor ---
@router.get("/vendor/{vendor_id}")
def get_vendor_dresses(vendor_id: int, db: Session = Depends(get_db)):
    dresses = db.query(models.Dress).filter(models.Dress.vendor_id == vendor_id).all()
    return dresses