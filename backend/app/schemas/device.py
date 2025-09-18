from pydantic import BaseModel
from typing import Optional, List

# ---------------- Device Create ----------------
class DeviceCreate(BaseModel):
    device_uuid: str
    user_id: Optional[str] = None
    device_type: str  # Correct field name

# ---------------- Device Update ----------------
class DeviceUpdate(BaseModel):
    attested: Optional[bool] = None
    last_attestation_hash: Optional[str] = None

# ---------------- Device Response ----------------
class DeviceResponse(BaseModel):
    id: str
    device_uuid: str
    user_id: Optional[str] = None
    device_type: str
    attested: bool
    last_attestation_hash: Optional[str] = None

# ---------------- Device Assignment ----------------
class DeviceAssignment(BaseModel):
    device_id: str
    user_id: str
    device_type: str

# ---------------- Device Attestation ----------------
class DeviceAttestation(BaseModel):
    device_id: str
    attested: bool
    attestation_hash: str
