from app.config import db
from bson import ObjectId
from datetime import datetime

DEVICE_COLLECTION = db.devices

def serialize(doc):
    if not doc:
        return None
    doc["id"] = str(doc["_id"])
    doc.pop("_id", None)
    return doc

# ---------------- Register Device ----------------
async def register_device(data: dict):
    # Ensure device_uuid uniqueness
    existing = await DEVICE_COLLECTION.find_one({"device_uuid": data["device_uuid"]})
    if existing:
        raise ValueError("Device UUID already exists")

    data["attested"] = False
    data["last_attestation_hash"] = None
    result = await DEVICE_COLLECTION.insert_one(data)
    data["id"] = str(result.inserted_id)
    return data

# ---------------- List Devices ----------------
async def list_devices():
    cursor = DEVICE_COLLECTION.find({})
    devices = []
    async for doc in cursor:
        devices.append(serialize(doc))
    return devices

# ---------------- Get Device by ID ----------------
async def get_device_by_id(device_id: str):
    doc = await DEVICE_COLLECTION.find_one({"_id": ObjectId(device_id)})
    return serialize(doc)

# ---------------- Update Device ----------------
async def update_device(device_id: str, data: dict):
    await DEVICE_COLLECTION.update_one(
        {"_id": ObjectId(device_id)},
        {"$set": data}
    )
    return await get_device_by_id(device_id)

# ---------------- Device Attestation ----------------
async def attest_device(device_id: str, attested: bool, attestation_hash: str):
    update_data = {
        "attested": attested,
        "last_attestation_hash": attestation_hash,
        "attestation_time": datetime.utcnow()
    }
    return await update_device(device_id, update_data)

# ---------------- Assign Device to User ----------------
async def assign_device_to_user(device_id: str, user_id: str, device_type: str):
    update_data = {
        "user_id": user_id,
        "device_type": device_type
    }
    return await update_device(device_id, update_data)
