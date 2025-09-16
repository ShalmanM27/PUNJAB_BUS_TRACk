# backend/app/crud/conductor.py
from app.config import db
from bson import ObjectId

CONDUCTOR_COLLECTION = db.conductors

def serialize(doc):
    if not doc:
        return None
    doc["id"] = str(doc["_id"])
    doc.pop("_id", None)
    return doc

async def create_conductor(data: dict):
    if await db.admins.find_one({"phone": data["phone"]}) or \
       await db.drivers.find_one({"phone": data["phone"]}) or \
       await db.conductors.find_one({"phone": data["phone"]}) or \
       await db.passengers.find_one({"phone": data["phone"]}):
        raise ValueError("Phone number already exists")
    result = await CONDUCTOR_COLLECTION.insert_one(data)
    data["id"] = str(result.inserted_id)
    return data

async def list_conductors():
    cursor = CONDUCTOR_COLLECTION.find({})
    conductors = []
    async for doc in cursor:
        doc.pop("assigned_vehicle_id", None)
        conductors.append(serialize(doc))
    return conductors

async def get_conductor_by_id(conductor_id: str):
    doc = await CONDUCTOR_COLLECTION.find_one({"_id": ObjectId(conductor_id)})
    return serialize(doc)
