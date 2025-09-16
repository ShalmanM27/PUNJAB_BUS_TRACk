# backend/app/crud/device.py
from app.config import db
from bson import ObjectId
from datetime import datetime

DEVICE_COLLECTION = db.devices

def serialize(doc):
    if not doc:
        return None
    doc["id"] = str(doc["_id"])
    doc.pop("_id", None)
    return doc

async def register_device(data: dict):
    data["attested"] = False
    data["last_attestation_hash"] = None
    result = await DEVICE_COLLECTION.insert_one(data)
    data["id"] = str(result.inserted_id)
    return data

async def list_devices():
    cursor = DEVICE_COLLECTION.find({})
    devices = []
    async for doc in cursor:
        devices.append(serialize(doc))
    return devices

async def get_device_by_id(device_id: str):
    doc = await DEVICE_COLLECTION.find_one({"_id": ObjectId(device_id)})
    return serialize(doc)

async def update_device(device_id: str, data: dict):
    await DEVICE_COLLECTION.update_one(
        {"_id": ObjectId(device_id)},
        {"$set": data}
    )
    return await get_device_by_id(device_id)
