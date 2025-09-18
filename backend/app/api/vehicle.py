from fastapi import APIRouter, HTTPException
from typing import List
from app.schemas.vehicle import VehicleCreate, VehicleResponse, VehicleUpdate
from app.crud import vehicle as vehicle_crud

router = APIRouter()

# ------------------- Admin-only -------------------
@router.post("/", response_model=VehicleResponse)
async def create_vehicle(vehicle: VehicleCreate):
    try:
        return await vehicle_crud.create_vehicle(vehicle.dict())
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/", response_model=List[VehicleResponse])
async def list_vehicles():
    return await vehicle_crud.list_vehicles()

@router.get("/{vehicle_id}", response_model=VehicleResponse)
async def get_vehicle(vehicle_id: str):
    vehicle = await vehicle_crud.get_vehicle_by_id(vehicle_id)
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    return vehicle

@router.put("/{vehicle_id}", response_model=VehicleResponse)
async def update_vehicle(vehicle_id: str, vehicle: VehicleUpdate):
    try:
        updated = await vehicle_crud.update_vehicle(vehicle_id, vehicle.dict(exclude_unset=True))
        if not updated:
            raise HTTPException(status_code=404, detail="Vehicle not found")
        return updated
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{vehicle_id}")
async def delete_vehicle(vehicle_id: str):
    result = await vehicle_crud.delete_vehicle(vehicle_id)
    if not result:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    return {"detail": "Vehicle deleted successfully"}
