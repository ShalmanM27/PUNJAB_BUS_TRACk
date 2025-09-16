from pydantic import BaseModel, EmailStr
from typing import Optional, List
from enum import Enum

class Role(str, Enum):
    ADMIN = "admin"
    DRIVER = "driver"
    CONDUCTOR = "conductor"
    PASSENGER = "passenger"

class BaseUser(BaseModel):
    id: Optional[str]
    name: str
    email: Optional[EmailStr]
    phone: str
    role: Role
    device_ids: Optional[List[str]] = []

class AdminUser(BaseUser):
    role: Role = Role.ADMIN

class DriverUser(BaseUser):
    role: Role = Role.DRIVER
    license_number: str

class ConductorUser(BaseUser):
    role: Role = Role.CONDUCTOR

class PassengerUser(BaseUser):
    role: Role = Role.PASSENGER
