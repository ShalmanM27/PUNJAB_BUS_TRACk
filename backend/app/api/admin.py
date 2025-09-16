from fastapi import APIRouter, HTTPException
from typing import List
from app.schemas.user import AdminCreate, AdminResponse, DriverCreate, DriverResponse, ConductorCreate, ConductorResponse, PassengerResponse
from app.crud import admin as admin_crud
from app.crud import driver as driver_crud
from app.crud import conductor as conductor_crud
from app.crud import passenger as passenger_crud

router = APIRouter()

# ---------------- Admin ----------------
@router.post("/admins", response_model=AdminResponse)
async def create_admin(admin: AdminCreate):
    return await admin_crud.create_admin(admin.dict())

@router.get("/admins", response_model=List[AdminResponse])
async def list_admins():
    return await admin_crud.list_admins()

# ---------------- Driver ----------------
@router.post("/drivers", response_model=DriverResponse)
async def create_driver(driver: DriverCreate):
    return await driver_crud.create_driver(driver.dict())

@router.get("/drivers", response_model=List[DriverResponse])
async def list_drivers():
    return await driver_crud.list_drivers()

# ---------------- Conductor ----------------
@router.post("/conductors", response_model=ConductorResponse)
async def create_conductor(conductor: ConductorCreate):
    return await conductor_crud.create_conductor(conductor.dict())

@router.get("/conductors", response_model=List[ConductorResponse])
async def list_conductors():
    return await conductor_crud.list_conductors()

# ---------------- Passenger (View only) ----------------
@router.get("/passengers", response_model=List[PassengerResponse])
async def list_passengers():
    return await passenger_crud.list_passengers()
