from app.config import db
from bson import ObjectId

SESSION_COLLECTION = db.sessions
COUNTERS_COLLECTION = db.counters  # for auto-increment IDs


def serialize(doc):
    if not doc:
        return None
    doc["id"] = str(doc.get("id", str(doc["_id"])))
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


# ---------------- Create Session ----------------
async def create_session(data: dict):
    data["id"] = await get_next_session_id()
    result = await SESSION_COLLECTION.insert_one(data)
    return serialize(data)


# ---------------- List Sessions ----------------
async def list_sessions():
    cursor = SESSION_COLLECTION.find({})
    sessions = []
    async for doc in cursor:
        sessions.append(serialize(doc))
    return sessions


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
    await SESSION_COLLECTION.update_one({"id": int(session_id)}, {"$set": data})
    return await get_session_by_id(session_id)


# ---------------- Delete Session ----------------
async def delete_session(session_id: str):
    result = await SESSION_COLLECTION.delete_one({"id": int(session_id)})
    return result.deleted_count > 0
