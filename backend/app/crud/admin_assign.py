from app.config import db, w3, contract, ACCOUNT_ADDRESS, PRIVATE_KEY
from bson import ObjectId
from app.crud.device import assign_device_to_user, attest_device
from datetime import datetime
from web3.exceptions import ContractLogicError

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

    data["blockchain_tx_hash"] = None

    if send_to_chain:
        if not ACCOUNT_ADDRESS or not PRIVATE_KEY:
            raise ValueError("ACCOUNT_ADDRESS and PRIVATE_KEY must be set for blockchain transaction")

        fn = contract.functions.recordAssignment(
            data["vehicle_id"],
            str(data["route_id"]),
            str(data["route_id"]),
            data["driver_id"],
            data["timestamp"]
        )

        # Estimate gas fallback
        try:
            gas_estimate = fn.estimate_gas({"from": ACCOUNT_ADDRESS})
        except Exception:
            gas_estimate = 300_000

        # Nonce
        nonce = w3.eth.get_transaction_count(ACCOUNT_ADDRESS, "pending")

        tx = fn.build_transaction({
            "from": ACCOUNT_ADDRESS,
            "nonce": nonce,
            "gas": gas_estimate,
            "gasPrice": w3.eth.gas_price,
            "chainId": 1043
        })

        signed = w3.eth.account.sign_transaction(tx, private_key=PRIVATE_KEY)
        tx_hash = w3.eth.send_raw_transaction(signed.raw_transaction)
        tx_hash_hex = tx_hash.hex()
        data["blockchain_tx_hash"] = tx_hash_hex

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