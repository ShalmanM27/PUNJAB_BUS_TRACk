from fastapi import APIRouter, HTTPException
from typing import List
from app.schemas.device import DeviceCreate, DeviceResponse, DeviceUpdate, DeviceAssignment, DeviceAttestation
from app.crud import device as device_crud

router = APIRouter()

# ---------------- Register Device ----------------
@router.post("/register", response_model=DeviceResponse)
async def register_device(device: DeviceCreate):
    try:
        return await device_crud.register_device(device.dict())
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

# ---------------- List Devices ----------------
@router.get("/", response_model=List[DeviceResponse])
async def list_devices():
    return await device_crud.list_devices()

# ---------------- Get Device by ID ----------------
@router.get("/{device_id}", response_model=DeviceResponse)
async def get_device(device_id: str):
    device = await device_crud.get_device_by_id(device_id)
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")
    return device

# ---------------- Update Device ----------------
@router.put("/{device_id}", response_model=DeviceResponse)
async def update_device(device_id: str, device_update: DeviceUpdate):
    try:
        updated = await device_crud.update_device(device_id, device_update.dict(exclude_unset=True))
        if not updated:
            raise HTTPException(status_code=404, detail="Device not found")
        return updated
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

# ---------------- Attest Device ----------------
@router.post("/{device_id}/attest", response_model=DeviceResponse)
async def attest_device(device_id: str, attested: bool, attestation_hash: str):
    try:
        return await device_crud.attest_device(device_id, attested, attestation_hash)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

# ---------------- Assign Device to User ----------------
@router.post("/{device_id}/assign", response_model=DeviceResponse)
async def assign_device(device_id: str, user_id: str, device_type: str):
    if device_type not in ["driver", "conductor", "passenger"]:
        raise HTTPException(status_code=400, detail="Invalid device type")
    try:
        return await device_crud.assign_device_to_user(device_id, user_id, device_type)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
