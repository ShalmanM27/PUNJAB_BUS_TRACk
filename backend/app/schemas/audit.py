from pydantic import BaseModel
from typing import Optional, Dict

class AuditLogCreate(BaseModel):
    user_id: str
    action: str
    details: Optional[Dict] = None

class AuditLogResponse(BaseModel):
    id: str
    user_id: str
    action: str
    details: Optional[Dict] = None
    timestamp: str
