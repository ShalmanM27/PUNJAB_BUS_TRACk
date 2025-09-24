from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from datetime import datetime
from app.config import db
from bson import ObjectId

router = APIRouter()

CURRENT_COLLECTION = db.current_locations  # Latest location
SESSIONS_COLLECTION = db.sessions          # Session data

# ---------------- Payload Schema ----------------
class TelemetryData(BaseModel):
    session_id: int
    latitude: float
    longitude: float
    timestamp: datetime

# ---------------- Post GPS location ----------------
@router.post("/")
async def post_telemetry(data: TelemetryData):
    # 1. Fetch session info
    session = await SESSIONS_COLLECTION.find_one({"id": data.session_id})
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    # 2. Prepare data to store
    doc = {
        "session_id": data.session_id,
        "vehicle_id": session["vehicle_id"],
        "driver_id": session["driver_id"],
        "conductor_id": session.get("conductor_id"),
        "latitude": data.latitude,
        "longitude": data.longitude,
        "timestamp": data.timestamp
    }

    # 3. Upsert latest location for this session
    await CURRENT_COLLECTION.update_one(
        {"session_id": data.session_id},
        {"$set": doc},
        upsert=True
    )

    return {"message": "Location updated"}

# ---------------- Get latest location ----------------
@router.get("/{session_id}")
async def get_current_location(session_id: int):
    location = await CURRENT_COLLECTION.find_one({"session_id": session_id})
    if not location:
        raise HTTPException(status_code=404, detail="Location not found")
    
    # Return only relevant fields for frontend
    return {
        "latitude": location["latitude"],
        "longitude": location["longitude"],
        "timestamp": location["timestamp"],
        "vehicle_id": location["vehicle_id"],
        "driver_id": location["driver_id"],
        "conductor_id": location.get("conductor_id")
    }
