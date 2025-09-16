from app.config import db
from bson import ObjectId

collection = db["drivers"]

async def is_phone_exists(phone: str) -> bool:
    if await collection.find_one({"phone": phone}):
        return True
    for col in ["admins", "conductors", "passengers"]:
        if await db[col].find_one({"phone": phone}):
            return True
    return False

async def create_driver(data: dict):
    if await is_phone_exists(data["phone"]):
        raise Exception("Phone number already exists")
    result = await collection.insert_one(data)
    data["id"] = str(result.inserted_id)
    return data

async def list_drivers():
    drivers = []
    async for driver in collection.find():
        driver["id"] = str(driver["_id"])
        driver.pop("_id", None)
        # Remove irrelevant fields
        driver.pop("assigned_vehicle_id", None)
        driver.pop("route_id", None)
        drivers.append(driver)
    return drivers

async def get_driver_by_id(driver_id: str):
    driver = await collection.find_one({"_id": ObjectId(driver_id)})
    if driver:
        driver["id"] = str(driver["_id"])
        driver.pop("_id", None)
        driver.pop("assigned_vehicle_id", None)
        driver.pop("route_id", None)
    return driver
