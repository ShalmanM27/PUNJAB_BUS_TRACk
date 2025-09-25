from app.config import db
from bson import ObjectId
from app.crud.device import assign_device_to_user, attest_device
from datetime import datetime

ASSIGNMENT_COLLECTION = db.assignments

DEVICE_COLLECTION = db.devices
VEHICLE_COLLECTION = db.vehicles
USER_COLLECTIONS = {
    "driver": db.drivers,
    "conductor": db.conductors
}

def serialize(doc):
    if not doc:
        return None
    doc["id"] = str(doc["_id"])
    doc.pop("_id", None)
    return doc

# ---------------- Bind Device to User ----------------
async def bind_device_to_user(device_id: str, user_id: str, device_type: str):
    return await assign_device_to_user(device_id, user_id, device_type)

# ---------------- Attest Device ----------------
async def attest_device_admin(device_id: str, attested: bool, attestation_hash: str):
    return await attest_device(device_id, attested, attestation_hash)

# ---------------- Assign Vehicle to Driver ----------------
async def assign_vehicle_to_driver(vehicle_id: str, driver_id: str):
    vehicle = await VEHICLE_COLLECTION.find_one({"_id": ObjectId(vehicle_id)})
    if not vehicle:
        raise ValueError("Vehicle not found")
    
    driver = await USER_COLLECTIONS["driver"].find_one({"_id": ObjectId(driver_id)})
    if not driver:
        raise ValueError("Driver not found")
    
    await VEHICLE_COLLECTION.update_one(
        {"_id": ObjectId(vehicle_id)},
        {"$set": {"current_driver_id": driver_id}}
    )
    return serialize(await VEHICLE_COLLECTION.find_one({"_id": ObjectId(vehicle_id)}))

# ---------------- Assign Vehicle to Conductor ----------------
async def assign_vehicle_to_conductor(vehicle_id: str, conductor_id: str):
    vehicle = await VEHICLE_COLLECTION.find_one({"_id": ObjectId(vehicle_id)})
    if not vehicle:
        raise ValueError("Vehicle not found")
    
    conductor = await USER_COLLECTIONS["conductor"].find_one({"_id": ObjectId(conductor_id)})
    if not conductor:
        raise ValueError("Conductor not found")
    
    await VEHICLE_COLLECTION.update_one(
        {"_id": ObjectId(vehicle_id)},
        {"$set": {"current_conductor_id": conductor_id}}
    )
    return serialize(await VEHICLE_COLLECTION.find_one({"_id": ObjectId(vehicle_id)}))

# ---------------- Create Assignment ----------------
async def create_assignment(data: dict, send_to_chain=True):
    """
    data: {
        vehicle_id, driver_id, route_id, timestamp
    }
    """
    # Ensure uniqueness: one vehicle assigned at the same timestamp
    existing = await ASSIGNMENT_COLLECTION.find_one({
        "vehicle_id": data["vehicle_id"],
        "timestamp": data["timestamp"]
    })
    if existing:
        raise ValueError("Vehicle already has an assignment at this timestamp")

    # Remove blockchain logic
    data["blockchain_tx_hash"] = None

    result = await ASSIGNMENT_COLLECTION.insert_one(data)
    data["id"] = str(result.inserted_id)
    return data

# ---------------- List Assignments ----------------
async def list_assignments():
    cursor = ASSIGNMENT_COLLECTION.find({})
    assignments = []
    async for doc in cursor:
        assignments.append(serialize(doc))
    return assignments

# ---------------- Get Assignment by ID ----------------
async def get_assignment_by_id(assignment_id: str):
    doc = await ASSIGNMENT_COLLECTION.find_one({"_id": ObjectId(assignment_id)})
    return serialize(doc)