# backend/app/crud/audit.py
from app.config import db
from bson import ObjectId
from datetime import datetime

AUDIT_COLLECTION = db.audit

def serialize(doc):
    if not doc:
        return None
    doc["id"] = str(doc["_id"])
    doc.pop("_id", None)
    return doc

async def create_audit_event(data: dict):
    data["timestamp"] = datetime.utcnow()
    result = await AUDIT_COLLECTION.insert_one(data)
    data["id"] = str(result.inserted_id)
    return data

async def list_audit_events():
    cursor = AUDIT_COLLECTION.find({})
    events = []
    async for doc in cursor:
        events.append(serialize(doc))
    return events

async def get_audit_event_by_id(event_id: str):
    doc = await AUDIT_COLLECTION.find_one({"_id": ObjectId(event_id)})
    return serialize(doc)
