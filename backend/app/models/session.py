from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class Session(BaseModel):
    id: Optional[str]
    vehicle_id: str
    driver_id: str
    conductor_id: Optional[str]
    start_time: Optional[datetime]
    end_time: Optional[datetime]
    session_token: str
