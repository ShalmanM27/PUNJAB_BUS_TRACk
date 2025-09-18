from app.config import db
from bson import ObjectId

CONDUCTOR_COLLECTION = db.conductors

def serialize(doc):
    if not doc:
        return None
    doc["id"] = str(doc["_id"])
    doc.pop("_id", None)
    return doc

# ---------------- Create Conductor ----------------
async def create_conductor(data: dict):
    if await is_phone_unique(data["phone"]) is False:
        raise ValueError("Phone number already exists")
    # Remove assigned_vehicle_id if present
    data.pop("assigned_vehicle_id", None)
    result = await CONDUCTOR_COLLECTION.insert_one(data)
    data["id"] = str(result.inserted_id)
    return data

# ---------------- List Conductors ----------------
async def list_conductors():
    cursor = CONDUCTOR_COLLECTION.find({})
    conductors = []
    async for doc in cursor:
        # Remove assigned_vehicle_id if present
        doc.pop("assigned_vehicle_id", None)
        conductors.append(serialize(doc))
    return conductors

# ---------------- Get Conductor by ID ----------------
async def get_conductor_by_id(conductor_id: str):
    doc = await CONDUCTOR_COLLECTION.find_one({"_id": ObjectId(conductor_id)})
    # Remove assigned_vehicle_id if present
    if doc:
        doc.pop("assigned_vehicle_id", None)
    return serialize(doc)

# ---------------- Update Conductor ----------------
async def update_conductor(conductor_id: str, data: dict):
    # Remove assigned_vehicle_id if present
    data.pop("assigned_vehicle_id", None)
    await CONDUCTOR_COLLECTION.update_one({"_id": ObjectId(conductor_id)}, {"$set": data})
    return await get_conductor_by_id(conductor_id)

# ---------------- Delete Conductor ----------------
async def delete_conductor(conductor_id: str):
    result = await CONDUCTOR_COLLECTION.delete_one({"_id": ObjectId(conductor_id)})
    return result.deleted_count > 0

# ---------------- Utility ----------------
async def is_phone_unique(phone: str):
    collections = [db.admins, db.drivers, db.conductors, db.passengers]
    for col in collections:
        if await col.find_one({"phone": phone}):
            return False
    return True
