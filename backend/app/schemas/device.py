from pydantic import BaseModel
from typing import Optional

class DeviceCreate(BaseModel):
    device_uuid: str
    user_id: Optional[str] = None

class DeviceUpdate(BaseModel):
    attested: Optional[bool] = None
    last_attestation_hash: Optional[str] = None

class DeviceResponse(BaseModel):
    id: str
    device_uuid: str
    user_id: Optional[str]
    attested: bool
    last_attestation_hash: Optional[str]
