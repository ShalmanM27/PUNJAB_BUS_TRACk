import aiohttp
from app.config import db
from bson import ObjectId

ROUTE_COLLECTION = db.routes
COUNTERS_COLLECTION = db.counters  # For auto-increment
OSRM_BASE = "https://router.project-osrm.org/route/v1/driving"

def serialize(doc):
    if not doc:
        return None
    doc["id"] = str(doc.get("id", str(doc["_id"])))
    doc.pop("_id", None)
    for loc_key in ["source", "destination"]:
        loc = doc.get(loc_key)
        if isinstance(loc, dict):
            doc[loc_key] = {
                "name": loc.get("name", ""),
                "latitude": float(loc.get("latitude", 0)),
                "longitude": float(loc.get("longitude", 0)),
            }
        else:
            doc[loc_key] = {"name": "", "latitude": 0.0, "longitude": 0.0}
    # ensure route_geometry list exists
    doc["route_geometry"] = doc.get("route_geometry", [])
    return doc

# ---------------- Utility for auto-increment ----------------
async def get_next_route_id():
    counter = await COUNTERS_COLLECTION.find_one_and_update(
        {"_id": "route_id"},
        {"$inc": {"seq": 1}},
        upsert=True,
        return_document=True,
    )
    return counter["seq"]

# ---------------- Fetch road geometry from OSRM ----------------
async def fetch_osrm_geometry(stops: list):
    # OSRM expects: lon,lat;lon,lat;...
    coords = ";".join([f"{s['longitude']},{s['latitude']}" for s in stops])
    url = f"{OSRM_BASE}/{coords}?overview=full&geometries=geojson"
    async with aiohttp.ClientSession() as session:
        async with session.get(url) as resp:
            if resp.status != 200:
                raise ValueError("OSRM routing failed")
            data = await resp.json()
            if not data.get("routes"):
                raise ValueError("No route found by OSRM")
            return data["routes"][0]["geometry"]["coordinates"]
            # returns [[lon,lat], ...]

# ---------------- Create Route ----------------
async def create_route(data: dict):
    existing_vehicle = await ROUTE_COLLECTION.find_one({"vehicle_id": data["vehicle_id"]})
    if existing_vehicle:
        raise ValueError("Vehicle ID is already assigned to another route")

    data["id"] = await get_next_route_id()

    # Prepare stops for OSRM (source + intermediate + destination)
    stops = [data["source"]] + data.get("route_points", []) + [data["destination"]]
    geometry = await fetch_osrm_geometry(stops)

    # convert [lon,lat] → {"latitude":..,"longitude":..}
    data["route_geometry"] = [
        {"latitude": lat, "longitude": lon} for lon, lat in geometry
    ]

    await ROUTE_COLLECTION.insert_one(data)
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
        existing_vehicle = await ROUTE_COLLECTION.find_one({
            "vehicle_id": data["vehicle_id"],
            "id": {"$ne": int(route_id)}
        })
        if existing_vehicle:
            raise ValueError("Vehicle ID is already assigned to another route")

    # If stops changed, recompute geometry
    if any(k in data for k in ["source", "destination", "route_points"]):
        existing = await get_route_by_id(route_id)
        if not existing:
            return None
        merged = {**existing, **data}
        stops = [merged["source"]] + merged.get("route_points", []) + [merged["destination"]]
        geometry = await fetch_osrm_geometry(stops)
        data["route_geometry"] = [
            {"latitude": lat, "longitude": lon} for lon, lat in geometry
        ]

    await ROUTE_COLLECTION.update_one({"id": int(route_id)}, {"$set": data})
    return await get_route_by_id(route_id)

# ---------------- Delete Route ----------------
async def delete_route(route_id: str):
    result = await ROUTE_COLLECTION.delete_one({"id": int(route_id)})
    return result.deleted_count > 0
