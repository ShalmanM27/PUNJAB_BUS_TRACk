from fastapi import APIRouter
from typing import List
from app.schemas.device import DeviceCreate, DeviceResponse, DeviceUpdate
from app.crud import device as device_crud

router = APIRouter()

@router.post("/register", response_model=DeviceResponse)
async def register_device(device: DeviceCreate):
    return await device_crud.register_device(device.dict())

@router.get("/", response_model=List[DeviceResponse])
async def list_devices():
    return await device_crud.list_devices()

@router.put("/{device_id}", response_model=DeviceResponse)
async def update_device(device_id: str, device: DeviceUpdate):
    return await device_crud.update_device(device_id, device.dict(exclude_unset=True))
