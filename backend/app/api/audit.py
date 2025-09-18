from fastapi import APIRouter, HTTPException
from typing import List
from app.crud import audit as audit_crud
from app.schemas.audit import AuditLogCreate, AuditLogResponse

router = APIRouter()

# ---------------- Create Audit Log ----------------
@router.post("/", response_model=AuditLogResponse)
async def create_audit_log(data: AuditLogCreate):
    try:
        log = await audit_crud.create_audit_log(
            user_id=data.user_id,
            action=data.action,
            details=data.details
        )
        return log
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

# ---------------- List Audit Logs ----------------
@router.get("/", response_model=List[AuditLogResponse])
async def list_audit_logs():
    return await audit_crud.list_audit_logs()

# ---------------- Get Audit Log by ID ----------------
@router.get("/{audit_id}", response_model=AuditLogResponse)
async def get_audit_log(audit_id: str):
    log = await audit_crud.get_audit_log_by_id(audit_id)
    if not log:
        raise HTTPException(status_code=404, detail="Audit log not found")
    return log
