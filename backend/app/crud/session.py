from app.config import db
from bson import ObjectId
from datetime import datetime, timedelta

SESSION_COLLECTION = db.sessions
COUNTERS_COLLECTION = db.counters
ROUTE_COLLECTION = db.routes


def serialize(doc):
    if not doc:
        return None
    doc["id"] = str(doc.get("id", str(doc.get("_id"))))
    doc.pop("_id", None)
    return doc


# ---------------- Utility for auto-increment ----------------
async def get_next_session_id():
    counter = await COUNTERS_COLLECTION.find_one_and_update(
        {"_id": "session_id"},
        {"$inc": {"seq": 1}},
        upsert=True,
        return_document=True
    )
    return counter["seq"]


# ---------------- Route Estimated Time ----------------
async def get_route_estimated_time(vehicle_id: int):
    route = await ROUTE_COLLECTION.find_one({"vehicle_id": int(vehicle_id)})
    if route and "estimated_time" in route:
        return int(route["estimated_time"])
    return 0


# ---------------- Last Session for Entity ----------------
async def get_last_session(entity_field: str, entity_id: int):
    doc = await SESSION_COLLECTION.find_one(
        {entity_field: entity_id},
        sort=[("start_time", -1)]
    )
    return doc


# ---------------- Overlap Check ----------------
async def is_overlapping(entity_field: str, entity_id: int, new_start_time: datetime):
    last_session = await get_last_session(entity_field, entity_id)
    if not last_session:
        return False, None

    vehicle_id = last_session.get("vehicle_id")
    if not vehicle_id:
        return False, None

    est_minutes = await get_route_estimated_time(vehicle_id)
    last_start = last_session["start_time"]

    if isinstance(last_start, str):
        last_start = datetime.fromisoformat(last_start)

    last_end = last_start + timedelta(minutes=est_minutes)
    if last_end > new_start_time:
        return True, {**last_session, "calculated_end_time": last_end}

    return False, None


# ---------------- Hard Conflict Check ----------------
async def has_hard_conflict(field: str, entity_id: int, new_start_time: datetime, exclude_session_id: str = None):
    query = {field: entity_id, "start_time": new_start_time}
    if exclude_session_id:
        query["id"] = {"$ne": int(exclude_session_id)}
    return await SESSION_COLLECTION.find_one(query)


# ---------------- Create Session ----------------
async def create_session(data: dict):
    if not data.get("driver_id") or not data.get("vehicle_id"):
        raise ValueError("Driver ID and Vehicle ID are required.")

    # Parse start_time
    if isinstance(data["start_time"], str):
        new_start_time = datetime.fromisoformat(data["start_time"])
    else:
        new_start_time = data["start_time"]

    # Hard conflict checks
    if await has_hard_conflict("vehicle_id", int(data["vehicle_id"]), new_start_time):
        raise ValueError(f"Vehicle {data['vehicle_id']} already has a session at {new_start_time}")
    if await has_hard_conflict("driver_id", int(data["driver_id"]), new_start_time):
        raise ValueError(f"Driver {data['driver_id']} already has a session at {new_start_time}")
    if data.get("conductor_id"):
        if await has_hard_conflict("conductor_id", int(data["conductor_id"]), new_start_time):
            raise ValueError(f"Conductor {data['conductor_id']} already has a session at {new_start_time}")

    # Overlap checks
    overlap, last = await is_overlapping("driver_id", int(data["driver_id"]), new_start_time)
    if overlap:
        raise ValueError(
            f"Driver {data['driver_id']} busy with vehicle {last['vehicle_id']} until {last['calculated_end_time']}"
        )
    if data.get("conductor_id"):
        overlap, last = await is_overlapping("conductor_id", int(data["conductor_id"]), new_start_time)
        if overlap:
            raise ValueError(
                f"Conductor {data['conductor_id']} busy with vehicle {last['vehicle_id']} until {last['calculated_end_time']}"
            )
    overlap, last = await is_overlapping("vehicle_id", int(data["vehicle_id"]), new_start_time)
    if overlap:
        raise ValueError(
            f"Vehicle {data['vehicle_id']} busy with driver {last['driver_id']} until {last['calculated_end_time']}"
        )

    # Auto-attach route_id from vehicle’s active route
    route = await ROUTE_COLLECTION.find_one({"vehicle_id": int(data["vehicle_id"])})
    if route:
        data["route_id"] = str(route["id"])

    # Calculate end_time
    est_minutes = await get_route_estimated_time(int(data["vehicle_id"]))
    data["end_time"] = new_start_time + timedelta(minutes=est_minutes) if est_minutes else None

    data["id"] = await get_next_session_id()
    await SESSION_COLLECTION.insert_one(data)
    return serialize(data)


# ---------------- List Sessions ----------------
async def list_sessions():
    cursor = SESSION_COLLECTION.find({}).sort("start_time", 1)
    return [serialize(doc) async for doc in cursor]


# ---------------- Get Session by ID ----------------
async def get_session_by_id(session_id: str):
    doc = await SESSION_COLLECTION.find_one({"id": int(session_id)}) if session_id.isdigit() else None
    if not doc:
        try:
            doc = await SESSION_COLLECTION.find_one({"_id": ObjectId(session_id)})
        except Exception:
            doc = None
    return serialize(doc)


# ---------------- Update Session ----------------
async def update_session(session_id: str, data: dict):
    existing = await get_session_by_id(session_id)
    if not existing:
        return None

    new_start_time = data.get("start_time", existing["start_time"])
    if isinstance(new_start_time, str):
        new_start_time = datetime.fromisoformat(new_start_time)

    vehicle_id = int(data.get("vehicle_id", existing["vehicle_id"]))
    driver_id = int(data.get("driver_id", existing["driver_id"]))
    conductor_id = data.get("conductor_id", existing.get("conductor_id"))
    conductor_id = int(conductor_id) if conductor_id else None

    # Hard conflict checks
    if await has_hard_conflict("vehicle_id", vehicle_id, new_start_time, session_id):
        raise ValueError(f"Vehicle {vehicle_id} already has a session at {new_start_time}")
    if await has_hard_conflict("driver_id", driver_id, new_start_time, session_id):
        raise ValueError(f"Driver {driver_id} already has a session at {new_start_time}")
    if conductor_id:
        if await has_hard_conflict("conductor_id", conductor_id, new_start_time, session_id):
            raise ValueError(f"Conductor {conductor_id} already has a session at {new_start_time}")

    # Overlap checks
    overlap, last = await is_overlapping("driver_id", driver_id, new_start_time)
    if overlap and str(last["id"]) != session_id:
        raise ValueError(
            f"Driver {driver_id} busy with vehicle {last['vehicle_id']} until {last['calculated_end_time']}"
        )
    if conductor_id:
        overlap, last = await is_overlapping("conductor_id", conductor_id, new_start_time)
        if overlap and str(last["id"]) != session_id:
            raise ValueError(
                f"Conductor {conductor_id} busy with vehicle {last['vehicle_id']} until {last['calculated_end_time']}"
            )
    overlap, last = await is_overlapping("vehicle_id", vehicle_id, new_start_time)
    if overlap and str(last["id"]) != session_id:
        raise ValueError(
            f"Vehicle {vehicle_id} busy with driver {last['driver_id']} until {last['calculated_end_time']}"
        )

    # Update end_time
    est_minutes = await get_route_estimated_time(vehicle_id)
    data["end_time"] = new_start_time + timedelta(minutes=est_minutes) if est_minutes else None

    await SESSION_COLLECTION.update_one({"id": int(session_id)}, {"$set": data})
    return await get_session_by_id(session_id)


# ---------------- Delete Session ----------------
async def delete_session(session_id: str):
    result = await SESSION_COLLECTION.delete_one({"id": int(session_id)})
    return result.deleted_count > 0


# ---------------- Get Upcoming Immediate Session for Vehicle ----------------
async def get_upcoming_session_for_vehicle(vehicle_id: str):
    now = datetime.utcnow()
    query = {
        "vehicle_id": {"$in": [vehicle_id, int(vehicle_id)]},
        "start_time": {"$gte": now}
    }
    doc = await SESSION_COLLECTION.find_one(query, sort=[("start_time", 1)])
    return serialize(doc)

