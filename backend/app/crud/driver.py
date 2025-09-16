# backend/app/crud/driver.py
from app.config import db
from bson import ObjectId

DRIVER_COLLECTION = db.drivers

def serialize(doc):
    if not doc:
        return None
    doc["id"] = str(doc["_id"])
    doc.pop("_id", None)
    return doc

async def create_driver(data: dict):
    if await db.admins.find_one({"phone": data["phone"]}) or \
       await db.drivers.find_one({"phone": data["phone"]}) or \
       await db.conductors.find_one({"phone": data["phone"]}) or \
       await db.passengers.find_one({"phone": data["phone"]}):
        raise ValueError("Phone number already exists")
    result = await DRIVER_COLLECTION.insert_one(data)
    data["id"] = str(result.inserted_id)
    return data

async def list_drivers():
    cursor = DRIVER_COLLECTION.find({})
    drivers = []
    async for doc in cursor:
        doc.pop("assigned_vehicle_id", None)
        drivers.append(serialize(doc))
    return drivers

async def get_driver_by_id(driver_id: str):
    doc = await DRIVER_COLLECTION.find_one({"_id": ObjectId(driver_id)})
    return serialize(doc)
