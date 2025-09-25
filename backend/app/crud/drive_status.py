from app.config import db

DRIVE_STATUS_COLLECTION = db.drive_status

async def set_drive_status(session_id: int, status: str, timestamp: str):
    # status: "started" or "completed"
    update = {"status": status}
    if status == "started":
        update["start_time"] = timestamp
    elif status == "completed":
        update["end_time"] = timestamp
    await DRIVE_STATUS_COLLECTION.update_one(
        {"session_id": session_id},
        {"$set": {"session_id": session_id, **update}},
        upsert=True
    )

async def get_drive_status(session_id: int):
    doc = await DRIVE_STATUS_COLLECTION.find_one({"session_id": session_id})
    if not doc:
        return None
    return {
        "session_id": doc["session_id"],
        "status": doc.get("status"),
        "start_time": doc.get("start_time"),
        "end_time": doc.get("end_time"),
    }
