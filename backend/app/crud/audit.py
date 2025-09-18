from app.config import db
from bson import ObjectId
from datetime import datetime

AUDIT_COLLECTION = db.audit_logs

def serialize(doc):
    if not doc:
        return None
    doc["id"] = str(doc["_id"])
    doc.pop("_id", None)
    return doc

# ---------------- Create Audit Log ----------------
async def create_audit_log(user_id: str, action: str, details: dict = None):
    audit_doc = {
        "user_id": user_id,
        "action": action,
        "details": details or {},
        "timestamp": datetime.utcnow()
    }
    result = await AUDIT_COLLECTION.insert_one(audit_doc)
    audit_doc["id"] = str(result.inserted_id)
    return audit_doc

# ---------------- List Audit Logs ----------------
async def list_audit_logs():
    cursor = AUDIT_COLLECTION.find({}).sort("timestamp", -1)
    logs = []
    async for doc in cursor:
        logs.append(serialize(doc))
    return logs

# ---------------- Get Audit Log by ID ----------------
async def get_audit_log_by_id(audit_id: str):
    doc = await AUDIT_COLLECTION.find_one({"_id": ObjectId(audit_id)})
    return serialize(doc)
