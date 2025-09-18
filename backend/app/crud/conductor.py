from app.config import db
from bson import ObjectId

CONDUCTOR_COLLECTION = db.conductors
COUNTERS_COLLECTION = db.counters  # For auto-increment

def serialize(doc):
    if not doc:
        return None
    # Always return id as string for API compatibility
    doc["id"] = str(doc.get("id", str(doc.get("_id"))))
    doc.pop("_id", None)
    return doc

# ---------------- Utility for auto-increment ----------------
async def get_next_conductor_id():
    counter = await COUNTERS_COLLECTION.find_one_and_update(
        {"_id": "conductor_id"},
        {"$inc": {"seq": 1}},
        upsert=True,
        return_document=True
    )
    return counter["seq"]

# ---------------- Create Conductor ----------------
async def create_conductor(data: dict):
    if await is_phone_unique(data["phone"]) is False:
        raise ValueError("Phone number already exists")
    # Remove assigned_vehicle_id if present
    data.pop("assigned_vehicle_id", None)
    data["id"] = await get_next_conductor_id()
    result = await CONDUCTOR_COLLECTION.insert_one(data)
    # Return serialized document with string id
    return serialize(data)

# ---------------- List Conductors ----------------
async def list_conductors():
    cursor = CONDUCTOR_COLLECTION.find({})
    conductors = []
    async for doc in cursor:
        doc.pop("assigned_vehicle_id", None)
        conductors.append(serialize(doc))
    return conductors

# ---------------- Get Conductor by ID ----------------
async def get_conductor_by_id(conductor_id: str):
    # Try integer id first, fallback to ObjectId
    doc = await CONDUCTOR_COLLECTION.find_one({"id": int(conductor_id)}) if conductor_id.isdigit() else None
    if not doc:
        try:
            doc = await CONDUCTOR_COLLECTION.find_one({"_id": ObjectId(conductor_id)})
        except Exception:
            doc = None
    if doc:
        doc.pop("assigned_vehicle_id", None)
    return serialize(doc)

# ---------------- Update Conductor ----------------
async def update_conductor(conductor_id: str, data: dict):
    data.pop("assigned_vehicle_id", None)
    await CONDUCTOR_COLLECTION.update_one({"id": int(conductor_id)}, {"$set": data})
    return await get_conductor_by_id(conductor_id)

# ---------------- Delete Conductor ----------------
async def delete_conductor(conductor_id: str):
    result = await CONDUCTOR_COLLECTION.delete_one({"id": int(conductor_id)})
    return result.deleted_count > 0

# ---------------- Utility ----------------
async def is_phone_unique(phone: str):
    collections = [db.admins, db.drivers, db.conductors, db.passengers]
    for col in collections:
        if await col.find_one({"phone": phone}):
            return False
    return True
