from typing import List, Optional
from app.config import db
from app.schemas.telemetry import TelemetryCreate, TelemetryResponse
from datetime import datetime
from bson import ObjectId

SESSION_COLLECTION = db.sessions
TELEMETRY_COLLECTION = db.telemetry
COUNTERS_COLLECTION = db.counters

def serialize(doc):
    if not doc:
        return None
    doc["id"] = str(doc.get("id", str(doc["_id"])))
    doc.pop("_id", None)
    return doc

async def get_next_telemetry_id():
    counter = await COUNTERS_COLLECTION.find_one_and_update(
        {"_id": "telemetry_id"},
        {"$inc": {"seq": 1}},
        upsert=True,
        return_document=True,
    )
    return counter["seq"]

async def create_telemetry_transmission(telemetry_data: dict) -> TelemetryResponse:
    """
    Add GPS transmission to session and store in telemetry collection (keep only last 5 per session)
    """
    try:
        # Validate session exists and is active
        session_query = {"id": int(telemetry_data["session_id"])} if telemetry_data["session_id"].isdigit() else {"_id": telemetry_data["session_id"]}
        session = await SESSION_COLLECTION.find_one(session_query)
        if not session:
            raise ValueError(f"Session not found: {telemetry_data['session_id']}")
        
        # Validate driver exists and matches session - convert both to strings for comparison
        session_driver_id = str(session.get("driver_id"))
        request_driver_id = str(telemetry_data["driver_id"])
        if session_driver_id != request_driver_id:
            raise ValueError(f"Driver ID {request_driver_id} does not match session driver {session_driver_id}")
        
        # Create GPS point
        gps_point = {
            "lat": float(telemetry_data["latitude"]),
            "lng": float(telemetry_data["longitude"]),
            "timestamp": telemetry_data.get("timestamp", datetime.utcnow().isoformat())
        }
        
        # Store in telemetry collection
        telemetry_record = {
            "id": await get_next_telemetry_id(),
            "session_id": telemetry_data["session_id"],
            "vehicle_id": str(session.get("vehicle_id", "")),
            "driver_id": request_driver_id,
            "latitude": gps_point["lat"],
            "longitude": gps_point["lng"],
            "speed": float(telemetry_data.get("speed", 0)),
            "timestamp": gps_point["timestamp"],
            "created_at": datetime.utcnow().isoformat()
        }
        await TELEMETRY_COLLECTION.insert_one(telemetry_record)
        
        # Keep only last 5 telemetry records for this session
        await maintain_last_5_telemetry_records(telemetry_data["session_id"])
        
        # Update session with GPS history (keep only last 5)
        current_history = session.get("gps_history", [])
        current_history.append(gps_point)
        if len(current_history) > 5:
            current_history = current_history[-5:]
        
        await SESSION_COLLECTION.update_one(
            session_query,
            {"$set": {"gps_history": current_history}}
        )
        
        return TelemetryResponse(
            id=str(telemetry_record["id"]),
            vehicle_id=str(session.get("vehicle_id", "")),
            timestamp=gps_point["timestamp"],
            latitude=gps_point["lat"],
            longitude=gps_point["lng"],
            speed=float(telemetry_data.get("speed", 0))
        )
    except ValueError:
        raise
    except Exception as e:
        raise ValueError(f"Error processing telemetry data: {str(e)}")

async def maintain_last_5_telemetry_records(session_id: str):
    """
    Keep only the last 5 telemetry records for a session, delete older ones
    """
    try:
        # Get all telemetry records for this session, sorted by timestamp (newest first)
        cursor = TELEMETRY_COLLECTION.find({"session_id": session_id}).sort("timestamp", -1)
        records = []
        async for doc in cursor:
            records.append(doc)
        
        # If more than 5 records, delete the excess (oldest ones)
        if len(records) > 5:
            records_to_keep = records[:5]  # Keep first 5 (newest)
            records_to_delete = records[5:]  # Delete rest (oldest)
            
            # Delete the oldest records
            for record in records_to_delete:
                await TELEMETRY_COLLECTION.delete_one({"_id": record["_id"]})
                
    except Exception as e:
        # Log error but don't fail the main operation
        print(f"Error maintaining telemetry records for session {session_id}: {e}")

async def list_telemetry():
    cursor = TELEMETRY_COLLECTION.find({}).sort("timestamp", -1)
    telemetry_list = []
    async for doc in cursor:
        telemetry_list.append(serialize(doc))
    return telemetry_list

async def get_telemetry_by_session(session_id: str):
    cursor = TELEMETRY_COLLECTION.find({"session_id": session_id}).sort("timestamp", -1)
    telemetry_list = []
    async for doc in cursor:
        telemetry_list.append(serialize(doc))
    return telemetry_list

async def get_telemetry_by_id(telemetry_id: str):
    doc = await TELEMETRY_COLLECTION.find_one({"id": int(telemetry_id)}) if telemetry_id.isdigit() else None
    if not doc:
        try:
            doc = await TELEMETRY_COLLECTION.find_one({"_id": ObjectId(telemetry_id)})
        except Exception:
            doc = None
    return serialize(doc)

async def get_session_gps_history(session_id: str) -> List[dict]:
    """
    Get GPS history for a session from session document
    """
    try:
        session_query = {"id": int(session_id)} if session_id.isdigit() else {"_id": session_id}
        session = await SESSION_COLLECTION.find_one(session_query)
        if not session:
            return []
        
        return session.get("gps_history", [])
    except Exception:
        return []

async def get_latest_position(session_id: str) -> Optional[dict]:
    """
    Get the latest GPS position for a session from session document
    """
    history = await get_session_gps_history(session_id)
    return history[-1] if history else None
