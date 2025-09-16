from pydantic import BaseModel
from typing import Optional

class VehicleCreate(BaseModel):
    registration_number: str
    capacity: int

class VehicleUpdate(BaseModel):
    current_driver_id: Optional[str] = None
    current_conductor_id: Optional[str] = None

class VehicleResponse(BaseModel):
    id: str
    registration_number: str
    capacity: int
    current_driver_id: Optional[str] = None
    current_conductor_id: Optional[str] = None
