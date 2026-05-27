from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine
import models
from routers import auth, dresses, bookings, ai

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="AmId API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://amid-project-8ifkbux5k-husna-fathimaa-a-s-projects.vercel.app"
    ],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(dresses.router)
app.include_router(bookings.router)
app.include_router(ai.router)

@app.get("/")
def root():
    return {"message": "AmId API is running!"}