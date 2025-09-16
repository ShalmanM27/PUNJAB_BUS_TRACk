from app.config import db
from bson import ObjectId

USER_COLLECTION = db["users"]

def _sanitize_document(doc: dict) -> dict:
    if not doc:
        return doc
    sanitized = {}
    for k, v in doc.items():
        if k == "_id":
            sanitized["id"] = str(v)
        elif isinstance(v, ObjectId):
            sanitized[k] = str(v)
        elif isinstance(v, list):
            new_list = []
            for item in v:
                if isinstance(item, ObjectId):
                    new_list.append(str(item))
                else:
                    new_list.append(item)
            sanitized[k] = new_list
        else:
            sanitized[k] = v

    role = sanitized.get("role")
    if role == "admin":
        sanitized.pop("assigned_vehicle_id", None)
        sanitized.pop("route_id", None)
    elif role == "passenger":
        sanitized.pop("assigned_vehicle_id", None)
        sanitized.pop("route_id", None)
    return sanitized

async def create_admin(admin_data: dict):
    admin_record = {
        "name": admin_data.get("name"),
        "email": admin_data.get("email"),
        "phone": admin_data.get("phone"),
        "role": "admin",
        "device_ids": admin_data.get("device_ids", []),
    }
    result = await USER_COLLECTION.insert_one(admin_record)
    admin_record["id"] = str(result.inserted_id)
    return admin_record

async def create_driver(driver_data: dict):
    driver_record = {
        "name": driver_data.get("name"),
        "email": driver_data.get("email"),
        "phone": driver_data.get("phone"),
        "license_number": driver_data.get("license_number"),
        "role": "driver",
        "device_ids": driver_data.get("device_ids", []),
        "assigned_vehicle_id": None,
        "route_id": None,
    }
    result = await USER_COLLECTION.insert_one(driver_record)
    driver_record["id"] = str(result.inserted_id)
    return driver_record

async def create_conductor(conductor_data: dict):
    conductor_record = {
        "name": conductor_data.get("name"),
        "email": conductor_data.get("email"),
        "phone": conductor_data.get("phone"),
        "role": "conductor",
        "device_ids": conductor_data.get("device_ids", []),
        "assigned_vehicle_id": None,
        "route_id": None,
    }
    result = await USER_COLLECTION.insert_one(conductor_record)
    conductor_record["id"] = str(result.inserted_id)
    return conductor_record

async def create_passenger(passenger_data: dict):
    passenger_record = {
        "name": passenger_data.get("name"),
        "phone": passenger_data.get("phone"),
        "role": "passenger",
        "device_ids": passenger_data.get("device_ids", []),
    }
    result = await USER_COLLECTION.insert_one(passenger_record)
    passenger_record["id"] = str(result.inserted_id)
    return passenger_record

async def get_user_by_id(user_id: str):
    try:
        obj_id = ObjectId(user_id)
    except Exception:
        return None
    user = await USER_COLLECTION.find_one({"_id": obj_id})
    if user:
        return _sanitize_document(user)
    return None

async def list_users():
    users = []
    cursor = USER_COLLECTION.find()
    async for u in cursor:
        users.append(_sanitize_document(u))
    return users
