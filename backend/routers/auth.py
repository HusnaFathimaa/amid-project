from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models
import bcrypt
from jose import jwt
from pydantic import BaseModel

# --- Setup ---
router = APIRouter(prefix="/auth", tags=["Authentication"])
SECRET_KEY = "amid_secret_key_2024"
ALGORITHM = "HS256"

# --- Data shapes ---
class SignupData(BaseModel):
    name: str
    email: str
    password: str
    role: str

class LoginData(BaseModel):
    email: str
    password: str

# --- Signup endpoint ---
@router.post("/signup")
def signup(data: SignupData, db: Session = Depends(get_db)):
    existing = db.query(models.User).filter(models.User.email == data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed = bcrypt.hashpw(data.password.encode("utf-8"), bcrypt.gensalt())
    hashed_password = hashed.decode("utf-8")
    
    new_user = models.User(
        name=data.name,
        email=data.email,
        password_hash=hashed_password,
        role=data.role
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return {"message": "Account created successfully!", "role": new_user.role}

# --- Login endpoint ---
@router.post("/login")
def login(data: LoginData, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == data.email).first()
    if not user:
        raise HTTPException(status_code=400, detail="Email not found")
    
    password_matches = bcrypt.checkpw(
        data.password.encode("utf-8"),
        user.password_hash.encode("utf-8")
    )
    if not password_matches:
        raise HTTPException(status_code=400, detail="Wrong password")
    
    token = jwt.encode(
        {"user_id": user.id, "role": user.role, "name": user.name},
        SECRET_KEY,
        algorithm=ALGORITHM
    )
    
    return {
        "token": token,
        "role": user.role,
        "name": user.name,
        "user_id": user.id
    }