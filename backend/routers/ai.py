from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
import models
from pydantic import BaseModel
import anthropic

router = APIRouter(prefix="/ai", tags=["AI"])
client = anthropic.Anthropic(api_key="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")

# --- Data shapes ---
class RecommendRequest(BaseModel):
    occasion: str
    budget: float
    style: str

class ListingRequest(BaseModel):
    image_url: str
    price_per_day: float
    delivery_days: int

# --- AI Dress Recommender for Client ---
@router.post("/recommend")
def recommend_dresses(data: RecommendRequest, db: Session = Depends(get_db)):
    # Get all available dresses from database
    dresses = db.query(models.Dress).filter(models.Dress.is_available == True).all()
    
    # Build a list of dresses to show the AI
    dress_list = ""
    for dress in dresses:
        dress_list += f"- ID:{dress.id} | Name:{dress.name} | Description:{dress.description} | Price:₹{dress.price_per_day}/day\n"
    
    if not dress_list:
        return {"recommendation": "No dresses are available right now. Please check back later!"}
    
    # Ask Claude to recommend
    message = client.messages.create(
        model="claude-sonnet-4-5",
        max_tokens=500,
        messages=[{
            "role": "user",
            "content": f"""You are a helpful fashion assistant for AmId, a dress rental app.
            
A customer is looking for a dress with these preferences:
- Occasion: {data.occasion}
- Budget: ₹{data.budget} per day
- Style preference: {data.style}

Available dresses in our catalogue:
{dress_list}

Please recommend the best 1-2 dresses from the catalogue that match their needs.
Be friendly, specific, and mention why each dress suits their occasion and style.
Keep your response under 100 words."""
        }]
    )
    
    return {"recommendation": message.content[0].text}

# --- AI Listing Helper for Vendor ---
@router.post("/generate-listing")
def generate_listing(data: ListingRequest):
    message = client.messages.create(
        model="claude-sonnet-4-5",
        max_tokens=300,
        messages=[{
            "role": "user",
            "content": f"""You are a fashion expert helping vendors list dresses on AmId, a dress rental marketplace.

A vendor has uploaded a dress image and provided:
- Image URL: {data.image_url}
- Price: ₹{data.price_per_day} per day
- Delivery time: {data.delivery_days} days

Based on this information, generate:
1. A catchy dress name (max 5 words)
2. An attractive description (max 30 words)

Respond in this exact format:
NAME: [dress name here]
DESCRIPTION: [description here]"""
        }]
    )
    
    response_text = message.content[0].text
    lines = response_text.strip().split("\n")
    name = lines[0].replace("NAME:", "").strip()
    description = lines[1].replace("DESCRIPTION:", "").strip() if len(lines) > 1 else ""
    
    return {"name": name, "description": description}