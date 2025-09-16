# backend/app/crud/session.py
from app.config import db
from bson import ObjectId
from datetime import datetime

SESSION_COLLECTION = db.sessions

def serialize(doc):
    if not doc:
        return None
    doc["id"] = str(doc["_id"])
    doc.pop("_id", None)
    return doc

async def create_session(data: dict):
    session_doc = {
        "user_id": data["user_id"],
        "roles": data["roles"],
        "device_id": data["device_id"],
        "vehicle_id": data["vehicle_id"],
        "start_time": datetime.utcnow(),
        "end_time": None,
        "active": True
    }
    result = await db.sessions.insert_one(session_doc)
    session_doc["id"] = str(result.inserted_id)
    return session_doc

async def end_session(session_id: str):
    await db.sessions.update_one(
        {"_id": ObjectId(session_id)},
        {"$set": {"end_time": datetime.utcnow(), "active": False}}
    )
    session_doc = await db.sessions.find_one({"_id": ObjectId(session_id)})
    session_doc["id"] = str(session_doc["_id"])
    return session_doc

async def get_session_by_id(session_id: str):
    doc = await SESSION_COLLECTION.find_one({"_id": ObjectId(session_id)})
    return serialize(doc)

async def list_sessions():
    cursor = SESSION_COLLECTION.find({})
    sessions = []
    async for doc in cursor:
        sessions.append(serialize(doc))
    return sessions
