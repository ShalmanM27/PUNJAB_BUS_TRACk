from app.config import db
from bson import ObjectId

VEHICLE_COLLECTION = db.vehicles
COUNTERS_COLLECTION = db.counters  # For auto-increment

def serialize(doc):
    if not doc:
        return None
    # Always return id as string for API compatibility
    doc["id"] = str(doc.get("id", str(doc.get("_id"))))
    doc.pop("_id", None)
    return doc

# ---------------- Utility for auto-increment ----------------
async def get_next_vehicle_id():
    counter = await COUNTERS_COLLECTION.find_one_and_update(
        {"_id": "vehicle_id"},
        {"$inc": {"seq": 1}},
        upsert=True,
        return_document=True
    )
    return counter["seq"]

# ---------------- Create Vehicle ----------------
async def create_vehicle(data: dict):
    data["id"] = await get_next_vehicle_id()
    result = await VEHICLE_COLLECTION.insert_one(data)
    # Return serialized document with string id
    return serialize(data)

# ---------------- List Vehicles ----------------
async def list_vehicles():
    cursor = VEHICLE_COLLECTION.find({})
    vehicles = []
    async for doc in cursor:
        vehicles.append(serialize(doc))
    return vehicles

# ---------------- Get Vehicle by ID ----------------
async def get_vehicle_by_id(vehicle_id: str):
    # Try integer id first, fallback to ObjectId
    doc = await VEHICLE_COLLECTION.find_one({"id": int(vehicle_id)}) if vehicle_id.isdigit() else None
    if not doc:
        try:
            doc = await VEHICLE_COLLECTION.find_one({"_id": ObjectId(vehicle_id)})
        except Exception:
            doc = None
    return serialize(doc)

# ---------------- Update Vehicle ----------------
async def update_vehicle(vehicle_id: str, data: dict):
    await VEHICLE_COLLECTION.update_one({"id": int(vehicle_id)}, {"$set": data})
    return await get_vehicle_by_id(vehicle_id)

# ---------------- Delete Vehicle ----------------
async def delete_vehicle(vehicle_id: str):
    result = await VEHICLE_COLLECTION.delete_one({"id": int(vehicle_id)})
    return result.deleted_count > 0
