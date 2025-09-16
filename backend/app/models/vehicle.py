# backend/app/models/vehicle.py
from pydantic import BaseModel
from typing import Optional

class Vehicle(BaseModel):
    id: Optional[str]
    registration_number: str
    capacity: int
    current_driver_id: Optional[str]
    current_conductor_id: Optional[str]
