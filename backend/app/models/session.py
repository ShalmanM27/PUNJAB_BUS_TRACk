# backend/app/models/session.py
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class Session(BaseModel):
    id: Optional[str]
    user_id: str
    roles: str
    device_id: str
    vehicle_id: str
    start_time: datetime
    end_time: Optional[datetime]
    active: bool = True
