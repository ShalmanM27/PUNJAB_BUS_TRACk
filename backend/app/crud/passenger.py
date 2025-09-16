# backend/app/crud/passenger.py
from app.config import db
from bson import ObjectId

PASSENGER_COLLECTION = db.passengers

def serialize(doc):
    if not doc:
        return None
    doc["id"] = str(doc["_id"])
    doc.pop("_id", None)
    return doc

async def create_passenger(data: dict):
    if await db.admins.find_one({"phone": data["phone"]}) or \
       await db.drivers.find_one({"phone": data["phone"]}) or \
       await db.conductors.find_one({"phone": data["phone"]}) or \
       await db.passengers.find_one({"phone": data["phone"]}):
        raise ValueError("Phone number already exists")
    result = await PASSENGER_COLLECTION.insert_one(data)
    data["id"] = str(result.inserted_id)
    return data

async def list_passengers():
    cursor = PASSENGER_COLLECTION.find({})
    passengers = []
    async for doc in cursor:
        passengers.append(serialize(doc))
    return passengers

async def get_passenger_by_id(passenger_id: str):
    doc = await PASSENGER_COLLECTION.find_one({"_id": ObjectId(passenger_id)})
    return serialize(doc)
