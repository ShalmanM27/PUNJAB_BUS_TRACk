from fastapi import APIRouter
from typing import List
from app.schemas.telemetry import TelemetryCreate, TelemetryResponse
from app.crud import telemetry as telemetry_crud

router = APIRouter()

@router.post("/", response_model=TelemetryResponse)
async def create_telemetry(data: TelemetryCreate):
    return await telemetry_crud.create_telemetry(data.dict())

@router.get("/", response_model=List[TelemetryResponse])
async def list_telemetry():
    return await telemetry_crud.list_telemetry()
