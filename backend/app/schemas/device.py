# backend/app/schemas/device.py
from pydantic import BaseModel
from typing import Optional

class DeviceCreate(BaseModel):
    device_uuid: str
    user_id: Optional[str]
    device_type: str

class DeviceResponse(BaseModel):
    id: str
    device_uuid: str
    user_id: Optional[str]
    device_type: str
    attested: bool
    last_attestation_hash: Optional[str]

class DeviceUpdate(BaseModel):
    attested: Optional[bool]
    last_attestation_hash: Optional[str]
