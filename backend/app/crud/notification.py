from app.config import db
from bson import ObjectId

NOTIF_COLLECTION = db.notifications


def serialize(doc):
    doc["id"] = str(doc.get("id", str(doc["_id"])))
    doc.pop("_id", None)
    return doc


async def list_notifications():
    cursor = NOTIF_COLLECTION.find({"status": {"$ne": "completed"}})  # only not completed
    notifications = []
    async for doc in cursor:
        notifications.append(serialize(doc))
    return notifications


async def create_notification(data: dict):
    if "status" not in data:
        data["status"] = "new"
    # Insert and get the inserted_id
    result = await NOTIF_COLLECTION.insert_one(data)
    # Set the 'id' field to the string of the inserted ObjectId
    await NOTIF_COLLECTION.update_one(
        {"_id": result.inserted_id},
        {"$set": {"id": str(result.inserted_id)}}
    )
    doc = await NOTIF_COLLECTION.find_one({"_id": result.inserted_id})
    return serialize(doc)


async def update_notification_status(notification_id: str, status: str):
    await NOTIF_COLLECTION.update_one(
        {"id": notification_id},
        {"$set": {"status": status}},
    )
    doc = await NOTIF_COLLECTION.find_one({"id": notification_id})
    return serialize(doc) if doc else None
