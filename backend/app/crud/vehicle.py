from app.config import db
from bson import ObjectId

VEHICLE_COLLECTION = db.vehicles

def serialize(doc):
    if not doc:
        return None
    doc["id"] = str(doc["_id"])
    doc.pop("_id", None)
    return doc

# ---------------- Create Vehicle ----------------
async def create_vehicle(data: dict):
    result = await VEHICLE_COLLECTION.insert_one(data)
    data["id"] = str(result.inserted_id)
    return data

# ---------------- List Vehicles ----------------
async def list_vehicles():
    cursor = VEHICLE_COLLECTION.find({})
    vehicles = []
    async for doc in cursor:
        vehicles.append(serialize(doc))
    return vehicles

# ---------------- Get Vehicle by ID ----------------
async def get_vehicle_by_id(vehicle_id: str):
    doc = await VEHICLE_COLLECTION.find_one({"_id": ObjectId(vehicle_id)})
    return serialize(doc)

# ---------------- Update Vehicle ----------------
async def update_vehicle(vehicle_id: str, data: dict):
    await VEHICLE_COLLECTION.update_one({"_id": ObjectId(vehicle_id)}, {"$set": data})
    return await get_vehicle_by_id(vehicle_id)

# ---------------- Delete Vehicle ----------------
async def delete_vehicle(vehicle_id: str):
    result = await VEHICLE_COLLECTION.delete_one({"_id": ObjectId(vehicle_id)})
    return result.deleted_count > 0
