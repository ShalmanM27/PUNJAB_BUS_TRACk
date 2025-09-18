from fastapi import APIRouter, HTTPException
from typing import List
from app.schemas.user import ConductorCreate, ConductorResponse
from app.crud import conductor as conductor_crud

router = APIRouter()

# ------------------- Admin-only -------------------
@router.post("/", response_model=ConductorResponse)
async def create_conductor(conductor: ConductorCreate):
    try:
        return await conductor_crud.create_conductor(conductor.dict())
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/", response_model=List[ConductorResponse])
async def list_conductors():
    return await conductor_crud.list_conductors()

@router.get("/{conductor_id}", response_model=ConductorResponse)
async def get_conductor(conductor_id: str):
    conductor = await conductor_crud.get_conductor_by_id(conductor_id)
    if not conductor:
        raise HTTPException(status_code=404, detail="Conductor not found")
    return conductor

@router.put("/{conductor_id}", response_model=ConductorResponse)
async def update_conductor(conductor_id: str, conductor: ConductorCreate):
    try:
        updated = await conductor_crud.update_conductor(conductor_id, conductor.dict(exclude_unset=True))
        if not updated:
            raise HTTPException(status_code=404, detail="Conductor not found")
        return updated
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{conductor_id}")
async def delete_conductor(conductor_id: str):
    result = await conductor_crud.delete_conductor(conductor_id)
    if not result:
        raise HTTPException(status_code=404, detail="Conductor not found")
    return {"detail": "Conductor deleted successfully"}
