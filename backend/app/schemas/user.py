from pydantic import BaseModel, EmailStr
from typing import Optional, List
from enum import Enum

class Role(str, Enum):
    ADMIN = "admin"
    DRIVER = "driver"
    CONDUCTOR = "conductor"
    PASSENGER = "passenger"

# ---------------- Admin ----------------
class AdminCreate(BaseModel):
    name: str
    email: Optional[EmailStr]
    phone: str

class AdminResponse(AdminCreate):
    id: str
    device_ids: Optional[List[str]] = []

# ---------------- Driver ----------------
class DriverCreate(BaseModel):
    name: str
    email: Optional[EmailStr]
    phone: str
    license_number: str

class DriverResponse(DriverCreate):
    id: str
    device_ids: Optional[List[str]] = []

# ---------------- Conductor ----------------
class ConductorCreate(BaseModel):
    name: str
    email: Optional[EmailStr]
    phone: str

class ConductorResponse(ConductorCreate):
    id: str
    device_ids: Optional[List[str]] = []

# ---------------- Passenger ----------------
class PassengerCreate(BaseModel):
    name: str
    phone: str

class PassengerResponse(PassengerCreate):
    id: str
    device_ids: Optional[List[str]] = []
