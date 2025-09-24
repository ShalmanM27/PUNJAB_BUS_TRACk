from fastapi import APIRouter, HTTPException
from typing import List
from app.schemas.telemetry import TelemetryCreate, TelemetryResponse
from app.crud import telemetry as telemetry_crud

router = APIRouter()

@router.post("/", response_model=TelemetryResponse)
async def post_telemetry(telemetry: TelemetryCreate):
    """
    Post Telemetry - matches API spec: POST /telemetry/
    """
    try:
        # Convert Pydantic model to dict
        transmission_data = {
            "session_id": telemetry.session_id,
            "driver_id": telemetry.driver_id, 
            "latitude": telemetry.latitude,
            "longitude": telemetry.longitude,
            "speed": telemetry.speed,
            "timestamp": telemetry.timestamp
        }
        
        return await telemetry_crud.create_telemetry_transmission(transmission_data)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.get("/", response_model=List[dict])
async def list_telemetry():
    """
    List all telemetry records
    """
    return await telemetry_crud.list_telemetry()

@router.get("/{session_id}")
async def get_current_location(session_id: str):
    """
    Get Current Location - matches API spec: GET /telemetry/{session_id}
    """
    try:
        position = await telemetry_crud.get_latest_position(session_id)
        if not position:
            raise HTTPException(status_code=404, detail="No GPS data found for session")
        return position
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.get("/session/{session_id}/records")
async def get_telemetry_by_session(session_id: str):
    """
    Get all telemetry records for a session
    """
    return await telemetry_crud.get_telemetry_by_session(session_id)

@router.get("/record/{telemetry_id}")
async def get_telemetry_record(telemetry_id: str):
    """
    Get specific telemetry record by ID
    """
    telemetry = await telemetry_crud.get_telemetry_by_id(telemetry_id)
    if not telemetry:
        raise HTTPException(status_code=404, detail="Telemetry record not found")
    return telemetry

# Keep existing endpoints for compatibility
@router.post("/transmit", response_model=TelemetryResponse)
async def transmit_gps(telemetry: TelemetryCreate):
    """
    Legacy endpoint for GPS transmission
    """
    return await post_telemetry(telemetry)

@router.get("/session/{session_id}/history")
async def get_gps_history(session_id: str):
    """
    Get GPS transmission history for a session (last 5 points)
    """
    history = await telemetry_crud.get_session_gps_history(session_id)
    return {"session_id": session_id, "gps_history": history}

@router.get("/session/{session_id}/latest")
async def get_latest_position(session_id: str):
    """
    Get latest GPS position for a session
    """
    return await get_current_location(session_id)
