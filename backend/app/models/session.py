from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class Session(BaseModel):
    id: Optional[str]
    driver_id: str
    conductor_id: Optional[str] = None
    vehicle_id: str
    route_id: str
    route_name: Optional[str] = None
    start_time: datetime
    end_time: Optional[datetime] = None
