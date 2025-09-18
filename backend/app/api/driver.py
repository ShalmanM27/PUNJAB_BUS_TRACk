from fastapi import APIRouter, HTTPException
from typing import List
from app.schemas.user import DriverCreate, DriverResponse
from app.crud import driver as driver_crud

router = APIRouter()

# ------------------- Admin-only -------------------
@router.post("/", response_model=DriverResponse)
async def create_driver(driver: DriverCreate):
    try:
        return await driver_crud.create_driver(driver.dict())
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/", response_model=List[DriverResponse])
async def list_drivers():
    return await driver_crud.list_drivers()

@router.get("/{driver_id}", response_model=DriverResponse)
async def get_driver(driver_id: str):
    driver = await driver_crud.get_driver_by_id(driver_id)
    if not driver:
        raise HTTPException(status_code=404, detail="Driver not found")
    return driver

@router.put("/{driver_id}", response_model=DriverResponse)
async def update_driver(driver_id: str, driver: DriverCreate):
    try:
        updated = await driver_crud.update_driver(driver_id, driver.dict(exclude_unset=True))
        if not updated:
            raise HTTPException(status_code=404, detail="Driver not found")
        return updated
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{driver_id}")
async def delete_driver(driver_id: str):
    result = await driver_crud.delete_driver(driver_id)
    if not result:
        raise HTTPException(status_code=404, detail="Driver not found")
    return {"detail": "Driver deleted successfully"}
