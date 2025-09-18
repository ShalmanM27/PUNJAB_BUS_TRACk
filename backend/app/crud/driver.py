from app.config import db
from bson import ObjectId

DRIVER_COLLECTION = db.drivers

def serialize(doc):
    if not doc:
        return None
    doc["id"] = str(doc["_id"])
    doc.pop("_id", None)
    return doc

# ---------------- Create Driver ----------------
async def create_driver(data: dict):
    # Only admin can call this, so no role check here
    if await is_phone_unique(data["phone"]) is False:
        raise ValueError("Phone number already exists")
    result = await DRIVER_COLLECTION.insert_one(data)
    data["id"] = str(result.inserted_id)
    return data

# ---------------- List Drivers ----------------
async def list_drivers():
    cursor = DRIVER_COLLECTION.find({})
    drivers = []
    async for doc in cursor:
        doc.pop("assigned_vehicle_id", None)
        drivers.append(serialize(doc))
    return drivers

# ---------------- Get Driver by ID ----------------
async def get_driver_by_id(driver_id: str):
    doc = await DRIVER_COLLECTION.find_one({"_id": ObjectId(driver_id)})
    return serialize(doc)

# ---------------- Update Driver ----------------
async def update_driver(driver_id: str, data: dict):
    await DRIVER_COLLECTION.update_one({"_id": ObjectId(driver_id)}, {"$set": data})
    return await get_driver_by_id(driver_id)

# ---------------- Delete Driver ----------------
async def delete_driver(driver_id: str):
    result = await DRIVER_COLLECTION.delete_one({"_id": ObjectId(driver_id)})
    return result.deleted_count > 0

# ---------------- Utility ----------------
async def is_phone_unique(phone: str):
    collections = [db.admins, db.drivers, db.conductors, db.passengers]
    for col in collections:
        if await col.find_one({"phone": phone}):
            return False
    return True
