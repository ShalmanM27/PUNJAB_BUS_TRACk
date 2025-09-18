from fastapi import APIRouter, HTTPException
from typing import List
from app.crud import telemetry as telemetry_crud
from app.schemas.telemetry import TelemetryCreate, TelemetryResponse

router = APIRouter()

# ---------------- Record Telemetry ----------------
@router.post("/", response_model=TelemetryResponse)
async def record_telemetry(data: TelemetryCreate):
    try:
        telemetry = await telemetry_crud.record_telemetry(
            data.vehicle_id,
            data.latitude,
            data.longitude,
            data.speed
        )
        return telemetry
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

# ---------------- List Telemetry for Vehicle ----------------
@router.get("/vehicle/{vehicle_id}", response_model=List[TelemetryResponse])
async def list_telemetry(vehicle_id: str):
    return await telemetry_crud.list_telemetry(vehicle_id)

# ---------------- Get Latest Telemetry ----------------
@router.get("/vehicle/{vehicle_id}/latest", response_model=TelemetryResponse)
async def get_latest(vehicle_id: str):
    telemetry = await telemetry_crud.get_latest_telemetry(vehicle_id)
    if not telemetry:
        raise HTTPException(status_code=404, detail="No telemetry found")
    return telemetry
