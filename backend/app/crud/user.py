from app.config import db
from bson import ObjectId

ADMIN_COLLECTION = db.admins
DRIVER_COLLECTION = db.drivers
CONDUCTOR_COLLECTION = db.conductors
PASSENGER_COLLECTION = db.passengers

# ---------------- Utils ----------------
def serialize(doc):
    if not doc:
        return None
    doc["id"] = str(doc["_id"])
    doc.pop("_id", None)
    return doc

async def is_phone_unique(phone: str):
    collections = [ADMIN_COLLECTION, DRIVER_COLLECTION, CONDUCTOR_COLLECTION, PASSENGER_COLLECTION]
    for col in collections:
        if await col.find_one({"phone": phone}):
            return False
    return True

# ---------------- Admin ----------------
async def create_admin(data: dict):
    if not await is_phone_unique(data["phone"]):
        raise ValueError("Phone number already exists")
    result = await ADMIN_COLLECTION.insert_one(data)
    data["id"] = str(result.inserted_id)
    return data

async def list_admins():
    cursor = ADMIN_COLLECTION.find({})
    return [serialize(doc) async for doc in cursor]

async def get_admin_by_id(admin_id: str):
    doc = await ADMIN_COLLECTION.find_one({"_id": ObjectId(admin_id)})
    return serialize(doc)

# ---------------- Driver ----------------
async def create_driver(data: dict):
    if not await is_phone_unique(data["phone"]):
        raise ValueError("Phone number already exists")
    # Remove assigned_vehicle_id if present
    data.pop("assigned_vehicle_id", None)
    result = await DRIVER_COLLECTION.insert_one(data)
    data["id"] = str(result.inserted_id)
    return data

async def list_drivers():
    cursor = DRIVER_COLLECTION.find({})
    return [serialize(doc) async for doc in cursor]

async def get_driver_by_id(driver_id: str):
    doc = await DRIVER_COLLECTION.find_one({"_id": ObjectId(driver_id)})
    return serialize(doc)

async def update_driver(driver_id: str, data: dict):
    await DRIVER_COLLECTION.update_one({"_id": ObjectId(driver_id)}, {"$set": data})
    return await get_driver_by_id(driver_id)

# ---------------- Conductor ----------------
async def create_conductor(data: dict):
    if not await is_phone_unique(data["phone"]):
        raise ValueError("Phone number already exists")
    # Remove assigned_vehicle_id if present
    data.pop("assigned_vehicle_id", None)
    result = await CONDUCTOR_COLLECTION.insert_one(data)
    data["id"] = str(result.inserted_id)
    return data

async def list_conductors():
    cursor = CONDUCTOR_COLLECTION.find({})
    return [serialize(doc) async for doc in cursor]

async def get_conductor_by_id(conductor_id: str):
    doc = await CONDUCTOR_COLLECTION.find_one({"_id": ObjectId(conductor_id)})
    return serialize(doc)

async def update_conductor(conductor_id: str, data: dict):
    await CONDUCTOR_COLLECTION.update_one({"_id": ObjectId(conductor_id)}, {"$set": data})
    return await get_conductor_by_id(conductor_id)

# ---------------- Passenger ----------------
async def create_passenger(data: dict):
    if not await is_phone_unique(data["phone"]):
        raise ValueError("Phone number already exists")
    result = await PASSENGER_COLLECTION.insert_one(data)
    data["id"] = str(result.inserted_id)
    return data

async def list_passengers():
    cursor = PASSENGER_COLLECTION.find({})
    return [serialize(doc) async for doc in cursor]

async def get_passenger_by_id(passenger_id: str):
    doc = await PASSENGER_COLLECTION.find_one({"_id": ObjectId(passenger_id)})
    return serialize(doc)

async def update_passenger(passenger_id: str, data: dict):
    await PASSENGER_COLLECTION.update_one({"_id": ObjectId(passenger_id)}, {"$set": data})
    return await get_passenger_by_id(passenger_id)
