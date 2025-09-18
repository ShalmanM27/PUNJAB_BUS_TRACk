from app.config import db
from bson import ObjectId

ROUTE_COLLECTION = db.routes

def serialize(doc):
    if not doc:
        return None
    doc["id"] = str(doc["_id"])
    doc.pop("_id", None)
    return doc

# ---------------- Create Route ----------------
async def create_route(data: dict):
    existing = await ROUTE_COLLECTION.find_one({"route_name": data["route_name"]})
    if existing:
        raise ValueError("Route name already exists")

    result = await ROUTE_COLLECTION.insert_one(data)
    data["id"] = str(result.inserted_id)
    return data

# ---------------- List Routes ----------------
async def list_routes():
    cursor = ROUTE_COLLECTION.find({})
    routes = []
    async for doc in cursor:
        routes.append(serialize(doc))
    return routes

# ---------------- Get Route by ID ----------------
async def get_route_by_id(route_id: str):
    doc = await ROUTE_COLLECTION.find_one({"_id": ObjectId(route_id)})
    return serialize(doc)

# ---------------- Update Route ----------------
async def update_route(route_id: str, data: dict):
    if "route_name" in data:
        # Ensure unique route name
        existing = await ROUTE_COLLECTION.find_one({"route_name": data["route_name"], "_id": {"$ne": ObjectId(route_id)}})
        if existing:
            raise ValueError("Route name already exists")

    await ROUTE_COLLECTION.update_one({"_id": ObjectId(route_id)}, {"$set": data})
    return await get_route_by_id(route_id)

# ---------------- Delete Route ----------------
async def delete_route(route_id: str):
    result = await ROUTE_COLLECTION.delete_one({"_id": ObjectId(route_id)})
    return result.deleted_count > 0
