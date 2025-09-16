# backend/app/models/telemetry.py
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class Telemetry(BaseModel):
    id: Optional[str]
    vehicle_id: str
    user_id: str
    gps_lat: float
    gps_long: float
    speed: float
    signature: str
    timestamp: Optional[datetime]
