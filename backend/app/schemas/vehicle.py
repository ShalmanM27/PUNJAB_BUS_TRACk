from pydantic import BaseModel
from typing import Optional

class VehicleCreate(BaseModel):
    registration_number: str
    capacity: int

class VehicleResponse(BaseModel):
    id: str
    registration_number: str
    capacity: int

class VehicleUpdate(BaseModel):
    registration_number: Optional[str] = None
    capacity: Optional[int] = None