# backend/app/crud/telemetry.py
from app.config import db
from bson import ObjectId
from datetime import datetime

TELEMETRY_COLLECTION = db.telemetry

def serialize(doc):
    if not doc:
        return None
    doc["id"] = str(doc["_id"])
    doc.pop("_id", None)
    return doc

async def create_telemetry(data: dict):
    data["timestamp"] = datetime.utcnow()
    result = await TELEMETRY_COLLECTION.insert_one(data)
    data["id"] = str(result.inserted_id)
    return data

async def list_telemetry():
    cursor = TELEMETRY_COLLECTION.find({})
    telemetry_list = []
    async for doc in cursor:
        telemetry_list.append(serialize(doc))
    return telemetry_list

async def get_telemetry_by_id(telemetry_id: str):
    doc = await TELEMETRY_COLLECTION.find_one({"_id": ObjectId(telemetry_id)})
    return serialize(doc)
