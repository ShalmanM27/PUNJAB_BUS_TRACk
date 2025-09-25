from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.crud import drive_status as drive_status_crud

router = APIRouter()

class DriveStatusSetRequest(BaseModel):
    session_id: int
    status: str  # "started" or "completed"
    timestamp: str

@router.post("/set")
async def set_drive_status(req: DriveStatusSetRequest):
    await drive_status_crud.set_drive_status(req.session_id, req.status, req.timestamp)
    return {"message": "Drive status updated"}

@router.get("/{session_id}")
async def get_drive_status(session_id: int):
    status = await drive_status_crud.get_drive_status(session_id)
    if not status:
        return {"status": None}
    return status
