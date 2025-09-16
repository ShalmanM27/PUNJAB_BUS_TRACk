from pydantic import BaseModel
from typing import Optional

class Device(BaseModel):
    id: Optional[str]
    device_uuid: str
    user_id: Optional[str]  # Bound driver/conductor
    attested: bool = False
    last_attestation_hash: Optional[str]
