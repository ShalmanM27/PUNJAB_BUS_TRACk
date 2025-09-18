from pydantic import BaseModel, EmailStr
from typing import List, Optional

# ---------------- Admin ----------------
class AdminCreate(BaseModel):
    name: str
    phone: str
    email: Optional[EmailStr] = None
    device_ids: Optional[List[str]] = []
    image: Optional[str] = None  # Added

class AdminResponse(BaseModel):
    id: str
    name: str
    phone: str
    email: Optional[str] = None
    device_ids: List[str] = []
    image: Optional[str] = None  # Added

# ---------------- Driver ----------------
class DriverCreate(BaseModel):
    name: str
    phone: str
    license_number: str
    image: Optional[str] = None  # Added

class DriverResponse(BaseModel):
    id: str
    name: str
    phone: str
    license_number: str
    image: Optional[str] = None  # Added

# ---------------- Conductor ----------------
class ConductorCreate(BaseModel):
    name: str
    phone: str
    email: Optional[EmailStr] = None  # Added
    image: Optional[str] = None  # Added

class ConductorResponse(BaseModel):
    id: str
    name: str
    phone: str
    email: Optional[str] = None  # Added
    image: Optional[str] = None  # Added

# ---------------- Passenger ----------------
class PassengerCreate(BaseModel):
    name: str
    phone: str
    email: Optional[EmailStr] = None
    password: str  # hashed in backend
    image: Optional[str] = None  # Added

class PassengerResponse(BaseModel):
    id: str
    name: str
    phone: str
    email: Optional[str] = None
    image: Optional[str] = None  # Added
