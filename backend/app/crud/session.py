from app.config import db
from bson import ObjectId
from datetime import datetime

SESSION_COLLECTION = db.sessions
VEHICLE_COLLECTION = db.vehicles
DRIVER_COLLECTION = db.drivers
CONDUCTOR_COLLECTION = db.conductors

def serialize(doc):
    if not doc:
        return None
    doc["id"] = str(doc["_id"])
    doc.pop("_id", None)
    return doc

# ---------------- Start Session ----------------
async def start_session(data: dict):
    # Validate driver
    driver = await DRIVER_COLLECTION.find_one({"_id": ObjectId(data["driver_id"])})
    if not driver:
        raise ValueError("Driver not found")

    # Validate conductor if provided
    if data.get("conductor_id"):
        conductor = await CONDUCTOR_COLLECTION.find_one({"_id": ObjectId(data["conductor_id"])})
        if not conductor:
            raise ValueError("Conductor not found")

    # Validate vehicle
    vehicle = await VEHICLE_COLLECTION.find_one({"_id": ObjectId(data["vehicle_id"])})
    if not vehicle:
        raise ValueError("Vehicle not found")

    # Check if vehicle is already in a session
    ongoing = await SESSION_COLLECTION.find_one({
        "vehicle_id": data["vehicle_id"],
        "end_time": None
    })
    if ongoing:
        raise ValueError("Vehicle is already in an active session")

    session_doc = {
        "driver_id": data["driver_id"],
        "conductor_id": data.get("conductor_id"),
        "vehicle_id": data["vehicle_id"],
        "start_time": data.get("start_time", datetime.utcnow()),
        "end_time": None
    }
    result = await SESSION_COLLECTION.insert_one(session_doc)
    session_doc["id"] = str(result.inserted_id)
    return session_doc

# ---------------- End Session ----------------
async def end_session(session_id: str, end_time: datetime = None):
    session_doc = await SESSION_COLLECTION.find_one({"_id": ObjectId(session_id)})
    if not session_doc:
        raise ValueError("Session not found")
    if session_doc.get("end_time"):
        raise ValueError("Session already ended")

    update = {"end_time": end_time or datetime.utcnow()}
    await SESSION_COLLECTION.update_one({"_id": ObjectId(session_id)}, {"$set": update})
    return await get_session_by_id(session_id)

# ---------------- Get Session by ID ----------------
async def get_session_by_id(session_id: str):
    doc = await SESSION_COLLECTION.find_one({"_id": ObjectId(session_id)})
    return serialize(doc)

# ---------------- List Sessions ----------------
async def list_sessions():
    cursor = SESSION_COLLECTION.find({})
    sessions = []
    async for doc in cursor:
        sessions.append(serialize(doc))
    return sessions
