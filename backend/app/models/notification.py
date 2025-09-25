from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class Notification(BaseModel):
    id: Optional[str] = None
    type: str
    session_id: Optional[str] = None
    driver_id: Optional[str] = None
    message: str
    timestamp: Optional[str] = None
    status: Optional[str] = "new"
