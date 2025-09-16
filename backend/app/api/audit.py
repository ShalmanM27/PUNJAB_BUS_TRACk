from fastapi import APIRouter
from typing import List
from app.schemas.audit import AuditEventCreate, AuditEventResponse
from app.crud import audit as audit_crud

router = APIRouter()

@router.post("/", response_model=AuditEventResponse)
async def create_audit_event(event: AuditEventCreate):
    return await audit_crud.create_audit_event(event.dict())

@router.get("/", response_model=List[AuditEventResponse])
async def list_audit_events():
    return await audit_crud.list_audit_events()
