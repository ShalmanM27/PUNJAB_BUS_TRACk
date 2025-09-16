from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class AuditEvent(BaseModel):
    id: Optional[str]
    event_type: str                # StartEvent, CheckpointEvent, PassengerBoardEvent, etc.
    session_id: Optional[str]
    device_id: Optional[str]
    hash: str                      # Cryptographic hash of the event
    timestamp: datetime
