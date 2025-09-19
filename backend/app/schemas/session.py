from pydantic import BaseModel
from typing import Optional
from datetime import datetime


# -------- Create Session --------
class SessionCreate(BaseModel):
    vehicle_id: str
    driver_id: str
    conductor_id: Optional[str] = None
    route_id: str
    start_time: datetime


# -------- Update Session --------
class SessionUpdate(BaseModel):
    vehicle_id: Optional[str] = None
    driver_id: Optional[str] = None
    conductor_id: Optional[str] = None
    route_id: Optional[str] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None


# -------- Response --------
class SessionResponse(BaseModel):
    id: str
    vehicle_id: str
    driver_id: str
    conductor_id: Optional[str] = None
    route_id: str
    route_name: Optional[str] = None
    start_time: datetime
    end_time: Optional[datetime] = None

    class Config:
        orm_mode = True
