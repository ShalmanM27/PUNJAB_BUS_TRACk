# backend/app/crud/vehicle.py
from app.config import db
from bson import ObjectId

VEHICLE_COLLECTION = db.vehicles

def serialize(doc):
    if not doc:
        return None
    doc["id"] = str(doc["_id"])
    doc.pop("_id", None)
    return doc

async def create_vehicle(data: dict):
    vehicle_doc = {
        "registration_number": data["registration_number"],
        "capacity": data["capacity"],
        "current_driver_id": None,
        "current_conductor_id": None
    }
    result = await db.vehicles.insert_one(vehicle_doc)
    vehicle_doc["id"] = str(result.inserted_id)
    return vehicle_doc


async def list_vehicles():
    cursor = VEHICLE_COLLECTION.find({})
    vehicles = []
    async for doc in cursor:
        vehicles.append(serialize(doc))
    return vehicles

async def get_vehicle_by_id(vehicle_id: str):
    doc = await VEHICLE_COLLECTION.find_one({"_id": ObjectId(vehicle_id)})
    return serialize(doc)

async def update_vehicle(vehicle_id: str, data: dict):
    await VEHICLE_COLLECTION.update_one({"_id": ObjectId(vehicle_id)}, {"$set": data})
    return await get_vehicle_by_id(vehicle_id)
