from app.config import db
from bson import ObjectId

ADMIN_COLLECTION = db.admins

def serialize(doc):
    if not doc:
        return None
    doc["id"] = str(doc["_id"])
    doc.pop("_id", None)
    return doc

# ---------------- Create Admin ----------------
async def create_admin(data: dict):
    phone = data.get("phone")
    if not phone:
        raise ValueError("Phone number is required")

    if await is_phone_unique(phone) is False:
        raise ValueError("Phone number already exists")

    data["device_ids"] = data.get("device_ids", [])
    result = await ADMIN_COLLECTION.insert_one(data)
    data["id"] = str(result.inserted_id)
    return data

# ---------------- List Admins ----------------
async def list_admins():
    cursor = ADMIN_COLLECTION.find({})
    admins = []
    async for doc in cursor:
        admins.append(serialize(doc))
    return admins

# ---------------- Get Admin by ID ----------------
async def get_admin_by_id(admin_id: str):
    try:
        obj_id = ObjectId(admin_id)
    except Exception:
        return None
    doc = await ADMIN_COLLECTION.find_one({"_id": obj_id})
    return serialize(doc)

# ---------------- Update Admin ----------------
async def update_admin(admin_id: str, data: dict):
    await ADMIN_COLLECTION.update_one({"_id": ObjectId(admin_id)}, {"$set": data})
    return await get_admin_by_id(admin_id)

# ---------------- Delete Admin ----------------
async def delete_admin(admin_id: str):
    result = await ADMIN_COLLECTION.delete_one({"_id": ObjectId(admin_id)})
    return result.deleted_count > 0

# ---------------- Utility ----------------
async def is_phone_unique(phone: str):
    collections = [db.admins, db.drivers, db.conductors, db.passengers]
    for col in collections:
        if await col.find_one({"phone": phone}):
            return False
    return True
