# backend/app/schemas/audit.py
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class AuditEventCreate(BaseModel):
    event_type: str
    user_id: str
    session_id: Optional[str]
    vehicle_id: Optional[str]
    device_id: Optional[str]
    passenger_id: Optional[str]
    description: Optional[str]
    event_hash: str

class AuditEventResponse(AuditEventCreate):
    id: str
    timestamp: datetime
