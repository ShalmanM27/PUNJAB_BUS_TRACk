from fastapi import APIRouter
from typing import List
from app.schemas.vehicle import VehicleCreate, VehicleResponse, VehicleUpdate
from app.crud import vehicle as vehicle_crud

router = APIRouter()

@router.post("/", response_model=VehicleResponse)
async def create_vehicle(vehicle: VehicleCreate):
    return await vehicle_crud.create_vehicle(vehicle.dict())

@router.get("/", response_model=List[VehicleResponse])
async def list_vehicles():
    return await vehicle_crud.list_vehicles()

@router.put("/{vehicle_id}", response_model=VehicleResponse)
async def update_vehicle(vehicle_id: str, vehicle: VehicleUpdate):
    return await vehicle_crud.update_vehicle(vehicle_id, vehicle.dict(exclude_unset=True))
