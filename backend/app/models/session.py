# backend/app/models/session.py
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class Session(BaseModel):
    id: Optional[str]
    driver_id: str
    conductor_id: Optional[str] = None
    vehicle_id: str
    route_id: str
    start_time: datetime
    end_time: Optional[datetime] = None  # <-- NEW FIELD
