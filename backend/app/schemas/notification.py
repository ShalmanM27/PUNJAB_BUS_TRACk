from pydantic import BaseModel
from typing import Optional

class NotificationCreate(BaseModel):
    type: str
    session_id: Optional[str] = None
    driver_id: Optional[str] = None
    message: str
    timestamp: Optional[str] = None
    status: Optional[str] = "new"  # add default status

class NotificationUpdate(BaseModel):
    status: str

class NotificationResponse(NotificationCreate):
    id: str

    class Config:
        orm_mode = True
