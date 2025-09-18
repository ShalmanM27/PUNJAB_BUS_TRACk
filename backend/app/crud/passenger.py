from app.config import db
from bson import ObjectId

PASSENGER_COLLECTION = db.passengers
COUNTERS_COLLECTION = db.counters  # For auto-increment

def serialize(doc):
    if not doc:
        return None
    # Always return id as string for API compatibility
    doc["id"] = str(doc.get("id", str(doc.get("_id"))))
    doc.pop("_id", None)
    return doc

# ---------------- Utility for auto-increment ----------------
async def get_next_passenger_id():
    counter = await COUNTERS_COLLECTION.find_one_and_update(
        {"_id": "passenger_id"},
        {"$inc": {"seq": 1}},
        upsert=True,
        return_document=True
    )
    return counter["seq"]

# ---------------- Create Passenger (Self-registration) ----------------
async def create_passenger(data: dict):
    if await is_phone_unique(data["phone"]) is False:
        raise ValueError("Phone number already exists")
    data["id"] = await get_next_passenger_id()
    result = await PASSENGER_COLLECTION.insert_one(data)
    # Return serialized document with string id
    return serialize(data)

# ---------------- List Passengers (Admin only) ----------------
async def list_passengers():
    cursor = PASSENGER_COLLECTION.find({})
    passengers = []
    async for doc in cursor:
        passengers.append(serialize(doc))
    return passengers

# ---------------- Get Passenger by ID ----------------
async def get_passenger_by_id(passenger_id: str):
    # Try integer id first, fallback to ObjectId
    doc = await PASSENGER_COLLECTION.find_one({"id": int(passenger_id)}) if passenger_id.isdigit() else None
    if not doc:
        try:
            doc = await PASSENGER_COLLECTION.find_one({"_id": ObjectId(passenger_id)})
        except Exception:
            doc = None
    return serialize(doc)

# ---------------- Update Passenger ----------------
async def update_passenger(passenger_id: str, data: dict):
    await PASSENGER_COLLECTION.update_one({"id": int(passenger_id)}, {"$set": data})
    return await get_passenger_by_id(passenger_id)

# ---------------- Delete Passenger ----------------
async def delete_passenger(passenger_id: str):
    result = await PASSENGER_COLLECTION.delete_one({"id": int(passenger_id)})
    return result.deleted_count > 0

# ---------------- Utility ----------------
async def is_phone_unique(phone: str):
    collections = [db.admins, db.drivers, db.conductors, db.passengers]
    for col in collections:
        if await col.find_one({"phone": phone}):
            return False
    return True
