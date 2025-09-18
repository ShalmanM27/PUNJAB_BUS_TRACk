from app.config import db
from bson import ObjectId
from datetime import datetime
from app.utils.gps import is_valid_gps
from app.utils.eta import compute_eta

TELEMETRY_COLLECTION = db.telemetry
VEHICLE_COLLECTION = db.vehicles
ROUTE_COLLECTION = db.routes  # Assuming routes are stored in this collection

def serialize(doc):
    if not doc:
        return None
    doc["id"] = str(doc["_id"])
    doc.pop("_id", None)
    return doc

# ---------------- Record Telemetry ----------------
async def record_telemetry(vehicle_id: str, latitude: float, longitude: float, speed: float = 0):
    if not is_valid_gps(latitude, longitude):
        raise ValueError("Invalid GPS coordinates")

    vehicle = await VEHICLE_COLLECTION.find_one({"_id": ObjectId(vehicle_id)})
    if not vehicle:
        raise ValueError("Vehicle not found")

    # Get route points from assigned route (assuming vehicle has route_id)
    route_points = []
    route_id = vehicle.get("route_id")
    if route_id:
        route_doc = await ROUTE_COLLECTION.find_one({"_id": ObjectId(route_id)})
        if route_doc:
            route_points = route_doc.get("points", [])

    # Compute ETA if route exists
    eta = compute_eta(latitude, longitude, route_points) if route_points else None

    telemetry_doc = {
        "vehicle_id": vehicle_id,
        "timestamp": datetime.utcnow(),
        "latitude": latitude,
        "longitude": longitude,
        "speed": speed,
        "eta_to_next_stop": eta
    }

    result = await TELEMETRY_COLLECTION.insert_one(telemetry_doc)
    telemetry_doc["id"] = str(result.inserted_id)
    return telemetry_doc

# ---------------- List Telemetry for Vehicle ----------------
async def list_telemetry(vehicle_id: str):
    cursor = TELEMETRY_COLLECTION.find({"vehicle_id": vehicle_id}).sort("timestamp", -1)
    telemetry = []
    async for doc in cursor:
        telemetry.append(serialize(doc))
    return telemetry

# ---------------- Get Latest Telemetry ----------------
async def get_latest_telemetry(vehicle_id: str):
    doc = await TELEMETRY_COLLECTION.find({"vehicle_id": vehicle_id}).sort("timestamp", -1).to_list(length=1)
    if doc:
        return serialize(doc[0])
    return None
