from fastapi import APIRouter, HTTPException
from typing import List
from app.schemas.admin_assign import DeviceAssignment, DeviceAttestation, AssignmentCreate, AssignmentResponse
from app.crud import admin_assign as admin_assign_crud
from app.schemas.device import DeviceResponse
from app.schemas.vehicle import VehicleResponse

router = APIRouter()

# ---------------- Bind Device to User ----------------
@router.post("/bind-device", response_model=DeviceResponse)
async def bind_device(binding: DeviceAssignment):
    try:
        device = await admin_assign_crud.bind_device_to_user(
            binding.device_id, binding.user_id, binding.device_type
        )
        if not device:
            raise HTTPException(status_code=404, detail="Device not found")
        return device
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

# ---------------- Attest Device ----------------
@router.post("/attest-device", response_model=DeviceResponse)
async def attest_device(attestation: DeviceAttestation):
    try:
        device = await admin_assign_crud.attest_device_admin(
            attestation.device_id, attestation.attested, attestation.attestation_hash
        )
        if not device:
            raise HTTPException(status_code=404, detail="Device not found")
        return device
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

# ---------------- Assign Vehicle to Driver ----------------
@router.put("/vehicle/{vehicle_id}/assign-driver/{driver_id}", response_model=VehicleResponse)
async def assign_driver(vehicle_id: str, driver_id: str):
    try:
        return await admin_assign_crud.assign_vehicle_to_driver(vehicle_id, driver_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

# ---------------- Assign Vehicle to Conductor ----------------
@router.put("/vehicle/{vehicle_id}/assign-conductor/{conductor_id}", response_model=VehicleResponse)
async def assign_conductor(vehicle_id: str, conductor_id: str):
    try:
        return await admin_assign_crud.assign_vehicle_to_conductor(vehicle_id, conductor_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

# ---------------- Create Assignment ----------------
@router.post("/assign-driver", response_model=AssignmentResponse)
async def assign_driver(assignment: AssignmentCreate):
    try:
        created = await admin_assign_crud.create_assignment(assignment.dict(), send_to_chain=True)
        return created
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

# ---------------- List Assignments ----------------
@router.get("/assignments", response_model=List[AssignmentResponse])
async def list_assignments():
    return await admin_assign_crud.list_assignments()

# ---------------- Get Assignment by ID ----------------
@router.get("/assignments/{assignment_id}", response_model=AssignmentResponse)
async def get_assignment(assignment_id: str):
    assignment = await admin_assign_crud.get_assignment_by_id(assignment_id)
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")
    return assignment