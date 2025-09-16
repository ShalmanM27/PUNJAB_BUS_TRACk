from app.config import db
from bson import ObjectId
from app.models.user import AdminUser

collection = db["admins"]

async def is_phone_exists(phone: str) -> bool:
    if await collection.find_one({"phone": phone}):
        return True
    # check other collections
    for col in ["drivers", "conductors", "passengers"]:
        if await db[col].find_one({"phone": phone}):
            return True
    return False

async def create_admin(data: dict):
    if await is_phone_exists(data["phone"]):
        raise Exception("Phone number already exists")
    result = await collection.insert_one(data)
    data["id"] = str(result.inserted_id)
    return data

async def list_admins():
    admins = []
    async for admin in collection.find():
        admin["id"] = str(admin["_id"])
        admin.pop("_id", None)
        admins.append(admin)
    return admins

async def get_admin_by_id(admin_id: str):
    admin = await collection.find_one({"_id": ObjectId(admin_id)})
    if admin:
        admin["id"] = str(admin["_id"])
        admin.pop("_id", None)
    return admin
