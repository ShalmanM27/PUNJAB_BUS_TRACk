from app.config import db
from bson import ObjectId

DRIVER_COLLECTION = db.drivers
COUNTERS_COLLECTION = db.counters  # Add this for auto-increment

def serialize(doc):
    if not doc:
        return None
    # Always return id as string for API compatibility
    doc["id"] = str(doc.get("id", str(doc["_id"])))
    doc.pop("_id", None)
    return doc

# ---------------- Utility for auto-increment ----------------
async def get_next_driver_id():
    counter = await COUNTERS_COLLECTION.find_one_and_update(
        {"_id": "driver_id"},
        {"$inc": {"seq": 1}},
        upsert=True,
        return_document=True
    )
    return counter["seq"]

# ---------------- Create Driver ----------------
async def create_driver(data: dict):
    # Only admin can call this, so no role check here
    if await is_phone_unique(data["phone"]) is False:
        raise ValueError("Phone number already exists")
    if await is_license_unique(data["license_number"]) is False:
        raise ValueError("License number already exists")
    data.pop("assigned_vehicle_id", None)
    data["id"] = await get_next_driver_id()
    result = await DRIVER_COLLECTION.insert_one(data)
    # Return serialized document with string id
    return serialize(data)

# ---------------- List Drivers ----------------
async def list_drivers():
    cursor = DRIVER_COLLECTION.find({})
    drivers = []
    async for doc in cursor:
        doc.pop("assigned_vehicle_id", None)
        drivers.append(serialize(doc))
    return drivers

# ---------------- Get Driver by ID ----------------
async def get_driver_by_id(driver_id):
    # Try integer id first, fallback to ObjectId
    doc = await DRIVER_COLLECTION.find_one({"id": int(driver_id)}) if driver_id.isdigit() else None
    if not doc:
        try:
            doc = await DRIVER_COLLECTION.find_one({"_id": ObjectId(driver_id)})
        except Exception:
            doc = None
    if doc:
        doc.pop("assigned_vehicle_id", None)
    return serialize(doc)

# ---------------- Update Driver ----------------
async def update_driver(driver_id, data: dict):
    data.pop("assigned_vehicle_id", None)
    # Prevent updating to a duplicate phone or license_number
    if "phone" in data and not await is_phone_unique(data["phone"], exclude_id=driver_id):
        raise ValueError("Phone number already exists")
    if "license_number" in data and not await is_license_unique(data["license_number"], exclude_id=driver_id):
        raise ValueError("License number already exists")
    await DRIVER_COLLECTION.update_one({"id": int(driver_id)}, {"$set": data})
    return await get_driver_by_id(driver_id)

# ---------------- Delete Driver ----------------
async def delete_driver(driver_id):
    result = await DRIVER_COLLECTION.delete_one({"id": int(driver_id)})
    return result.deleted_count > 0

# ---------------- Utility ----------------
async def is_phone_unique(phone: str, exclude_id=None):
    query = {"phone": phone}
    if exclude_id:
        query["id"] = {"$ne": int(exclude_id)}
    exists = await DRIVER_COLLECTION.find_one(query)
    if exists:
        return False
    # Also check in other collections
    collections = [db.admins, db.conductors, db.passengers]
    for col in collections:
        if await col.find_one({"phone": phone}):
            return False
    return True

async def is_license_unique(license_number: str, exclude_id=None):
    query = {"license_number": license_number}
    if exclude_id:
        query["id"] = {"$ne": int(exclude_id)}
    exists = await DRIVER_COLLECTION.find_one(query)
    return not bool(exists)
