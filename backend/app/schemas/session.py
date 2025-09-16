from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class SessionCreate(BaseModel):
    user_id: str
    roles: str
    device_id: str
    vehicle_id: str

class SessionEnd(BaseModel):
    session_id: str

class SessionResponse(BaseModel):
    id: str
    user_id: str
    roles: str
    device_id: str
    vehicle_id: str
    start_time: datetime
    end_time: Optional[datetime] = None
    active: bool
