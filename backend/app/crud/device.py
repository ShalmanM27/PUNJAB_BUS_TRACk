from app.config import db
from app.schemas.device import DeviceResponse
from bson import ObjectId

DEVICE_COLLECTION = db["devices"]

# --- Helper to convert MongoDB document to DeviceResponse ---
def format_device(doc) -> DeviceResponse:
    return DeviceResponse(
        id=str(doc["_id"]),
        device_uuid=doc["device_uuid"],
        user_id=doc.get("user_id"),
        attested=doc.get("attested", False),
        last_attestation_hash=doc.get("last_attestation_hash")
    )

# --- Create Device ---
async def create_device(device_data: dict) -> DeviceResponse:
    result = await DEVICE_COLLECTION.insert_one(device_data)
    new_doc = await DEVICE_COLLECTION.find_one({"_id": result.inserted_id})
    return format_device(new_doc)

# --- Get Device by ID ---
async def get_device_by_id(device_id: str) -> DeviceResponse | None:
    doc = await DEVICE_COLLECTION.find_one({"_id": ObjectId(device_id)})
    if doc:
        return format_device(doc)
    return None

# --- Update Device ---
async def update_device(device_id: str, update_data: dict) -> DeviceResponse | None:
    await DEVICE_COLLECTION.update_one({"_id": ObjectId(device_id)}, {"$set": update_data})
    return await get_device_by_id(device_id)

# --- List All Devices ---
async def list_devices() -> list[DeviceResponse]:
    devices = []
    async for doc in DEVICE_COLLECTION.find():
        devices.append(format_device(doc))
    return devices

# --- Delete Device (optional) ---
async def delete_device(device_id: str) -> bool:
    result = await DEVICE_COLLECTION.delete_one({"_id": ObjectId(device_id)})
    return result.deleted_count > 0
