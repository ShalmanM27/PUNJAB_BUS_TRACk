from fastapi import APIRouter, HTTPException
from typing import List
from app.schemas.session import SessionCreate, SessionResponse, SessionUpdate
from app.crud import session as session_crud

router = APIRouter()


# ---------------- Create Session ----------------
@router.post("/start", response_model=SessionResponse)
async def start_session(session: SessionCreate):
    try:
        return await session_crud.create_session(session.dict())
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


# ---------------- List Sessions ----------------
@router.get("/", response_model=List[SessionResponse])
async def list_sessions():
    return await session_crud.list_sessions()


# ---------------- Get Session by ID ----------------
@router.get("/{session_id}", response_model=SessionResponse)
async def get_session(session_id: str):
    session = await session_crud.get_session_by_id(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session


# ---------------- Update Session ----------------
@router.put("/{session_id}", response_model=SessionResponse)
async def update_session(session_id: str, session_update: SessionUpdate):
    try:
        updated = await session_crud.update_session(session_id, session_update.dict(exclude_unset=True))
        if not updated:
            raise HTTPException(status_code=404, detail="Session not found")
        return updated
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


# ---------------- Delete Session ----------------
@router.delete("/{session_id}")
async def delete_session(session_id: str):
    result = await session_crud.delete_session(session_id)
    if not result:
        raise HTTPException(status_code=404, detail="Session not found")
    return {"detail": "Session deleted successfully"}
