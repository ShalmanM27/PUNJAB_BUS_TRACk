from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class Telemetry(BaseModel):
    id: Optional[str]
    session_id: str
    latitude: float
    longitude: float
    timestamp: datetime
    speed: Optional[float]
