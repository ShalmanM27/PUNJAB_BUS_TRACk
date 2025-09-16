# backend/app/crud/admin.py
from app.config import db
from bson import ObjectId

ADMIN_COLLECTION = db.admins

def serialize(doc):
    if not doc:
        return None
    doc["id"] = str(doc["_id"])
    doc.pop("_id", None)
    return doc

async def create_admin(data: dict):
    # unique phone check
    if await db.admins.find_one({"phone": data["phone"]}) or \
       await db.drivers.find_one({"phone": data["phone"]}) or \
       await db.conductors.find_one({"phone": data["phone"]}) or \
       await db.passengers.find_one({"phone": data["phone"]}):
        raise ValueError("Phone number already exists")
    result = await ADMIN_COLLECTION.insert_one(data)
    data["id"] = str(result.inserted_id)
    return data

async def list_admins():
    cursor = ADMIN_COLLECTION.find({})
    admins = []
    async for doc in cursor:
        admins.append(serialize(doc))
    return admins

async def get_admin_by_id(admin_id: str):
    doc = await ADMIN_COLLECTION.find_one({"_id": ObjectId(admin_id)})
    return serialize(doc)
