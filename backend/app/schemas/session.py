from pydantic import BaseModel
from typing import Optional
from datetime import datetime

# ---------------- Session Create / Start ----------------
class SessionCreate(BaseModel):
    driver_id: str
    conductor_id: Optional[str] = None
    vehicle_id: str
    start_time: Optional[datetime] = None

# ---------------- Session Update / End ----------------
class SessionUpdate(BaseModel):
    end_time: Optional[datetime] = None

# ---------------- Session Response ----------------
class SessionResponse(BaseModel):
    id: str
    driver_id: str
    conductor_id: Optional[str] = None
    vehicle_id: str
    start_time: Optional[datetime]
    end_time: Optional[datetime]
