from pydantic import BaseModel, EmailStr
from typing import List, Optional

# ---------------- Admin ----------------
class AdminCreate(BaseModel):
    name: str
    phone: str
    email: Optional[EmailStr] = None
    device_ids: Optional[List[str]] = []

class AdminResponse(BaseModel):
    id: str
    name: str
    phone: str
    email: Optional[str] = None
    device_ids: List[str] = []

# ---------------- Driver ----------------
class DriverCreate(BaseModel):
    name: str
    phone: str
    license_number: str
    assigned_vehicle_id: Optional[str] = None

class DriverResponse(BaseModel):
    id: str
    name: str
    phone: str
    license_number: str
    assigned_vehicle_id: Optional[str] = None

# ---------------- Conductor ----------------
class ConductorCreate(BaseModel):
    name: str
    phone: str
    assigned_vehicle_id: Optional[str] = None

class ConductorResponse(BaseModel):
    id: str
    name: str
    phone: str
    assigned_vehicle_id: Optional[str] = None

# ---------------- Passenger ----------------
class PassengerCreate(BaseModel):
    name: str
    phone: str
    email: Optional[EmailStr] = None
    password: str  # hashed in backend

class PassengerResponse(BaseModel):
    id: str
    name: str
    phone: str
    email: Optional[str] = None
