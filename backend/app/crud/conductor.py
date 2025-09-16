from app.config import db
from bson import ObjectId

collection = db["conductors"]

async def is_phone_exists(phone: str) -> bool:
    if await collection.find_one({"phone": phone}):
        return True
    for col in ["admins", "drivers", "passengers"]:
        if await db[col].find_one({"phone": phone}):
            return True
    return False

async def create_conductor(data: dict):
    if await is_phone_exists(data["phone"]):
        raise Exception("Phone number already exists")
    result = await collection.insert_one(data)
    data["id"] = str(result.inserted_id)
    return data

async def list_conductors():
    conductors = []
    async for conductor in collection.find():
        conductor["id"] = str(conductor["_id"])
        conductor.pop("_id", None)
        # Remove irrelevant fields
        conductor.pop("assigned_vehicle_id", None)
        conductor.pop("route_id", None)
        conductors.append(conductor)
    return conductors

async def get_conductor_by_id(conductor_id: str):
    conductor = await collection.find_one({"_id": ObjectId(conductor_id)})
    if conductor:
        conductor["id"] = str(conductor["_id"])
        conductor.pop("_id", None)
        conductor.pop("assigned_vehicle_id", None)
        conductor.pop("route_id", None)
    return conductor
