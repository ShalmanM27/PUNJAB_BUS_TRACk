from fastapi import APIRouter, HTTPException
from typing import List
from app.schemas.user import (
    AdminCreate, AdminResponse,
    DriverCreate, DriverResponse,
    ConductorCreate, ConductorResponse,
    PassengerResponse
)
from app.crud import admin as admin_crud
from app.crud import driver as driver_crud
from app.crud import conductor as conductor_crud
from app.crud import passenger as passenger_crud

router = APIRouter()

# ------------------- Admin -------------------
@router.post("/admins", response_model=AdminResponse)
async def create_admin(admin: AdminCreate):
    try:
        return await admin_crud.create_admin(admin.dict())
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/admins", response_model=List[AdminResponse])
async def list_admins():
    return await admin_crud.list_admins()

@router.get("/admins/{admin_id}", response_model=AdminResponse)
async def get_admin(admin_id: str):
    admin = await admin_crud.get_admin_by_id(admin_id)
    if not admin:
        raise HTTPException(status_code=404, detail="Admin not found")
    return admin

@router.put("/admins/{admin_id}", response_model=AdminResponse)
async def update_admin(admin_id: str, admin: AdminCreate):
    updated = await admin_crud.update_admin(admin_id, admin.dict(exclude_unset=True))
    if not updated:
        raise HTTPException(status_code=404, detail="Admin not found")
    return updated

@router.delete("/admins/{admin_id}")
async def delete_admin(admin_id: str):
    deleted = await admin_crud.delete_admin(admin_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Admin not found")
    return {"message": "Admin deleted successfully"}


# ------------------- Driver -------------------
@router.post("/drivers", response_model=DriverResponse)
async def create_driver(driver: DriverCreate):
    try:
        return await driver_crud.create_driver(driver.dict())
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/drivers", response_model=List[DriverResponse])
async def list_drivers():
    return await driver_crud.list_drivers()

@router.get("/drivers/{driver_id}", response_model=DriverResponse)
async def get_driver(driver_id: str):
    driver = await driver_crud.get_driver_by_id(driver_id)
    if not driver:
        raise HTTPException(status_code=404, detail="Driver not found")
    return driver

@router.put("/drivers/{driver_id}", response_model=DriverResponse)
async def update_driver(driver_id: str, driver: DriverCreate):
    try:
        updated = await driver_crud.update_driver(driver_id, driver.dict(exclude_unset=True))
        if not updated:
            raise HTTPException(status_code=404, detail="Driver not found")
        return updated
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/drivers/{driver_id}")
async def delete_driver(driver_id: str):
    result = await driver_crud.delete_driver(driver_id)
    if not result:
        raise HTTPException(status_code=404, detail="Driver not found")
    return {"detail": "Driver deleted successfully"}


# ------------------- Conductor -------------------
@router.post("/conductors", response_model=ConductorResponse)
async def create_conductor(conductor: ConductorCreate):
    try:
        return await conductor_crud.create_conductor(conductor.dict())
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/conductors", response_model=List[ConductorResponse])
async def list_conductors():
    return await conductor_crud.list_conductors()

@router.get("/conductors/{conductor_id}", response_model=ConductorResponse)
async def get_conductor(conductor_id: str):
    conductor = await conductor_crud.get_conductor_by_id(conductor_id)
    if not conductor:
        raise HTTPException(status_code=404, detail="Conductor not found")
    return conductor

@router.put("/conductors/{conductor_id}", response_model=ConductorResponse)
async def update_conductor(conductor_id: str, conductor: ConductorCreate):
    try:
        updated = await conductor_crud.update_conductor(conductor_id, conductor.dict(exclude_unset=True))
        if not updated:
            raise HTTPException(status_code=404, detail="Conductor not found")
        return updated
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/conductors/{conductor_id}")
async def delete_conductor(conductor_id: str):
    result = await conductor_crud.delete_conductor(conductor_id)
    if not result:
        raise HTTPException(status_code=404, detail="Conductor not found")
    return {"detail": "Conductor deleted successfully"}


# ------------------- Passengers -------------------
@router.get("/passengers", response_model=List[PassengerResponse])
async def list_passengers():
    return await passenger_crud.list_passengers()

@router.get("/passengers/{passenger_id}", response_model=PassengerResponse)
async def get_passenger(passenger_id: str):
    passenger = await passenger_crud.get_passenger_by_id(passenger_id)
    if not passenger:
        raise HTTPException(status_code=404, detail="Passenger not found")
    return passenger

@router.delete("/passengers/{passenger_id}")
async def delete_passenger(passenger_id: str):
    result = await passenger_crud.delete_passenger(passenger_id)
    if not result:
        raise HTTPException(status_code=404, detail="Passenger not found")
    return {"detail": "Passenger deleted successfully"}
