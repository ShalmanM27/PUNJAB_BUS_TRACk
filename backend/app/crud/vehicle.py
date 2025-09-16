from app.config import db
from app.schemas.vehicle import VehicleResponse
from bson import ObjectId

VEHICLE_COLLECTION = db["vehicles"]

# --- Helper to convert MongoDB document to VehicleResponse ---
def format_vehicle(doc) -> VehicleResponse:
    return VehicleResponse(
        id=str(doc["_id"]),
        registration_number=doc["registration_number"],
        capacity=doc["capacity"],
        current_driver_id=doc.get("current_driver_id"),
        current_conductor_id=doc.get("current_conductor_id")
    )

# --- Create Vehicle ---
async def create_vehicle(vehicle_data: dict) -> VehicleResponse:
    result = await VEHICLE_COLLECTION.insert_one(vehicle_data)
    new_doc = await VEHICLE_COLLECTION.find_one({"_id": result.inserted_id})
    return format_vehicle(new_doc)

# --- Get Vehicle by ID ---
async def get_vehicle_by_id(vehicle_id: str) -> VehicleResponse | None:
    doc = await VEHICLE_COLLECTION.find_one({"_id": ObjectId(vehicle_id)})
    if doc:
        return format_vehicle(doc)
    return None

# --- Update Vehicle ---
async def update_vehicle(vehicle_id: str, update_data: dict) -> VehicleResponse | None:
    await VEHICLE_COLLECTION.update_one({"_id": ObjectId(vehicle_id)}, {"$set": update_data})
    return await get_vehicle_by_id(vehicle_id)

# --- List All Vehicles ---
async def list_vehicles() -> list[VehicleResponse]:
    vehicles = []
    async for doc in VEHICLE_COLLECTION.find():
        vehicles.append(format_vehicle(doc))
    return vehicles

# --- Delete Vehicle (optional) ---
async def delete_vehicle(vehicle_id: str) -> bool:
    result = await VEHICLE_COLLECTION.delete_one({"_id": ObjectId(vehicle_id)})
    return result.deleted_count > 0
