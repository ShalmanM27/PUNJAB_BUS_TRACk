from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class SessionCreate(BaseModel):
    driver_id: str
    conductor_id: Optional[str] = None
    vehicle_id: str
    start_time: datetime


class SessionUpdate(BaseModel):
    driver_id: Optional[str] = None
    conductor_id: Optional[str] = None
    vehicle_id: Optional[str] = None
    start_time: Optional[datetime] = None


class SessionResponse(BaseModel):
    id: str
    driver_id: str
    conductor_id: Optional[str] = None
    vehicle_id: str
    route_id: Optional[str] = None
    start_time: datetime
    end_time: Optional[datetime] = None  # <-- NEW FIELD
