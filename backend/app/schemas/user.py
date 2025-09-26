from pydantic import BaseModel, EmailStr
from typing import List, Optional

# ---------------- Admin ----------------
class AdminCreate(BaseModel):
    name: str
    phone: str
    device_ids: Optional[List[str]] = []
    image: Optional[str] = None

class AdminResponse(BaseModel):
    id: str
    name: str
    phone: str
    device_ids: List[str] = []
    image: Optional[str] = None

# ---------------- Driver ----------------
class DriverCreate(BaseModel):
    name: str
    phone: str
    license_number: str
    image: Optional[str] = None

class DriverResponse(BaseModel):
    id: str
    name: str
    phone: str
    license_number: str
    image: Optional[str] = None

# ---------------- Conductor ----------------
class ConductorCreate(BaseModel):
    name: str
    phone: str
    email: Optional[EmailStr] = None
    image: Optional[str] = None

class ConductorResponse(BaseModel):
    id: str
    name: str
    phone: str
    email: Optional[str] = None
    image: Optional[str] = None

# ---------------- Passenger ----------------
class PassengerCreate(BaseModel):
    name: str
    phone: str
    email: Optional[EmailStr] = None
    password: str
    image: Optional[str] = None

class PassengerResponse(BaseModel):
    id: str
    name: str
    phone: str
    email: Optional[str] = None
    image: Optional[str] = None
    id: str
    name: str
    phone: str
    email: Optional[str] = None
    image: Optional[str] = None
