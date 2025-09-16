from app.config import db
from bson import ObjectId

collection = db["passengers"]

async def is_phone_exists(phone: str) -> bool:
    if await collection.find_one({"phone": phone}):
        return True
    for col in ["admins", "drivers", "conductors"]:
        if await db[col].find_one({"phone": phone}):
            return True
    return False

async def create_passenger(data: dict):
    if await is_phone_exists(data["phone"]):
        raise Exception("Phone number already exists")
    result = await collection.insert_one(data)
    data["id"] = str(result.inserted_id)
    return data

async def list_passengers():
    passengers = []
    async for p in collection.find():
        p["id"] = str(p["_id"])
        p.pop("_id", None)
        passengers.append(p)
    return passengers

async def get_passenger_by_id(passenger_id: str):
    passenger = await collection.find_one({"_id": ObjectId(passenger_id)})
    if passenger:
        passenger["id"] = str(passenger["_id"])
        passenger.pop("_id", None)
    return passenger
