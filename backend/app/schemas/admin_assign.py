from pydantic import BaseModel
from typing import Optional

# Assign vehicle to driver/conductor
class VehicleAssignment(BaseModel):
    vehicle_id: str
    driver_id: Optional[str]
    conductor_id: Optional[str]

# Bind device to user
class DeviceAssignment(BaseModel):
    device_id: str
    user_id: str   # driver/conductor
    device_type: str  # "driver" or "conductor"

# Attest a device
class DeviceAttestation(BaseModel):
    device_id: str
    attested: bool
    attestation_hash: str

class AssignmentCreate(BaseModel):
    vehicle_id: str
    driver_id: str
    route_id: str
    timestamp: int  # Unix epoch time

class AssignmentResponse(BaseModel):
    id: Optional[str]
    vehicle_id: str
    driver_id: str
    route_id: str
    timestamp: int
    blockchain_tx_hash: Optional[str]