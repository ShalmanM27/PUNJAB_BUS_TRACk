# backend/app/models/user.py
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
    phone: str
    image: Optional[str] = None

class AdminUser(BaseUser):
    role: Role = Role.ADMIN

class DriverUser(BaseUser):
    role: Role = Role.DRIVER
    license_number: str

class ConductorUser(BaseUser):
    role: Role = Role.CONDUCTOR
    email: Optional[EmailStr] = None

class PassengerUser(BaseUser):
    role: Role = Role.PASSENGER
    email: Optional[EmailStr] = None
    password: str
    role: Role = Role.PASSENGER
