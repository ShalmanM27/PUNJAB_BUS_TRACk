from pydantic import BaseModel, Field
from typing import Optional

class TelemetryCreate(BaseModel):
    session_id: str
    driver_id: str
    latitude: float
    longitude: float
    speed: Optional[float] = 0
    timestamp: Optional[str] = None

class TelemetryResponse(BaseModel):
    id: str
    vehicle_id: str
    timestamp: str
    latitude: float
    longitude: float
    speed: float
    eta_to_next_stop: Optional[int] = None
