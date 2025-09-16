# backend/app/schemas/telemetry.py
from pydantic import BaseModel
from datetime import datetime

class TelemetryCreate(BaseModel):
    vehicle_id: str
    user_id: str
    gps_lat: float
    gps_long: float
    speed: float
    signature: str

class TelemetryResponse(TelemetryCreate):
    id: str
    timestamp: datetime
