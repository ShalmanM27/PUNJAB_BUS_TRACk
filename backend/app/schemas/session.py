from pydantic import BaseModel
from typing import Optional
from datetime import datetime


# -------- Create Session --------
class SessionCreate(BaseModel):
    driver_id: str
    conductor_id: Optional[str] = None
    vehicle_id: str
    start_time: datetime


# -------- Update Session --------
class SessionUpdate(BaseModel):
    driver_id: Optional[str] = None
    conductor_id: Optional[str] = None
    vehicle_id: Optional[str] = None
    start_time: Optional[datetime] = None


# -------- Response --------
class SessionResponse(BaseModel):
    id: str
    driver_id: str
    conductor_id: Optional[str] = None
    vehicle_id: str
    route_id: Optional[str] = None
    start_time: datetime
