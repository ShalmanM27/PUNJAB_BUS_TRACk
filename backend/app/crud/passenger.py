from app.config import db
from bson import ObjectId

PASSENGER_COLLECTION = db.passengers

def serialize(doc):
    if not doc:
        return None
    doc["id"] = str(doc["_id"])
    doc.pop("_id", None)
    return doc

# ---------------- Create Passenger (Self-registration) ----------------
async def create_passenger(data: dict):
    if await is_phone_unique(data["phone"]) is False:
        raise ValueError("Phone number already exists")
    result = await PASSENGER_COLLECTION.insert_one(data)
    data["id"] = str(result.inserted_id)
    return data

# ---------------- List Passengers (Admin only) ----------------
async def list_passengers():
    cursor = PASSENGER_COLLECTION.find({})
    passengers = []
    async for doc in cursor:
        passengers.append(serialize(doc))
    return passengers

# ---------------- Get Passenger by ID ----------------
async def get_passenger_by_id(passenger_id: str):
    doc = await PASSENGER_COLLECTION.find_one({"_id": ObjectId(passenger_id)})
    return serialize(doc)

# ---------------- Update Passenger ----------------
async def update_passenger(passenger_id: str, data: dict):
    await PASSENGER_COLLECTION.update_one({"_id": ObjectId(passenger_id)}, {"$set": data})
    return await get_passenger_by_id(passenger_id)

# ---------------- Delete Passenger ----------------
async def delete_passenger(passenger_id: str):
    result = await PASSENGER_COLLECTION.delete_one({"_id": ObjectId(passenger_id)})
    return result.deleted_count > 0

# ---------------- Utility ----------------
async def is_phone_unique(phone: str):
    collections = [db.admins, db.drivers, db.conductors, db.passengers]
    for col in collections:
        if await col.find_one({"phone": phone}):
            return False
    return True
