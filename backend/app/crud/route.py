from app.config import db
from bson import ObjectId

ROUTE_COLLECTION = db.routes
COUNTERS_COLLECTION = db.counters  # For auto-increment

def serialize(doc):
    if not doc:
        return None
    doc["id"] = str(doc.get("id", str(doc["_id"])))
    doc.pop("_id", None)
    # Ensure source and destination are always dicts with name, latitude, longitude
    for loc_key in ["source", "destination"]:
        loc = doc.get(loc_key)
        if isinstance(loc, dict):
            # Ensure all keys exist
            doc[loc_key] = {
                "name": loc.get("name", ""),
                "latitude": float(loc.get("latitude", 0)),
                "longitude": float(loc.get("longitude", 0)),
            }
        else:
            # fallback: empty location
            doc[loc_key] = {"name": "", "latitude": 0.0, "longitude": 0.0}
    return doc

# ---------------- Utility for auto-increment ----------------
async def get_next_route_id():
    counter = await COUNTERS_COLLECTION.find_one_and_update(
        {"_id": "route_id"},
        {"$inc": {"seq": 1}},
        upsert=True,
        return_document=True
    )
    return counter["seq"]

# ---------------- Create Route ----------------
async def create_route(data: dict):
    # Ensure unique vehicle_id
    existing_vehicle = await ROUTE_COLLECTION.find_one({"vehicle_id": data["vehicle_id"]})
    if existing_vehicle:
        raise ValueError("Vehicle ID is already assigned to another route")

    data["id"] = await get_next_route_id()
    result = await ROUTE_COLLECTION.insert_one(data)
    return serialize(data)

# ---------------- List Routes ----------------
async def list_routes():
    cursor = ROUTE_COLLECTION.find({})
    routes = []
    async for doc in cursor:
        routes.append(serialize(doc))
    return routes

# ---------------- Get Route by ID ----------------
async def get_route_by_id(route_id: str):
    # Try integer id first, fallback to ObjectId
    doc = await ROUTE_COLLECTION.find_one({"id": int(route_id)}) if route_id.isdigit() else None
    if not doc:
        try:
            doc = await ROUTE_COLLECTION.find_one({"_id": ObjectId(route_id)})
        except Exception:
            doc = None
    return serialize(doc)

# ---------------- Update Route ----------------
async def update_route(route_id: str, data: dict):
    if "vehicle_id" in data:
        # Ensure unique vehicle_id (exclude current route)
        existing_vehicle = await ROUTE_COLLECTION.find_one({
            "vehicle_id": data["vehicle_id"],
            "id": {"$ne": int(route_id)}
        })
        if existing_vehicle:
            raise ValueError("Vehicle ID is already assigned to another route")

    await ROUTE_COLLECTION.update_one({"id": int(route_id)}, {"$set": data})
    return await get_route_by_id(route_id)

# ---------------- Delete Route ----------------
async def delete_route(route_id: str):
    result = await ROUTE_COLLECTION.delete_one({"id": int(route_id)})
    return result.deleted_count > 0

# No changes needed for route_points, as the schema now enforces the structure.
