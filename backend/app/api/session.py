from fastapi import APIRouter, HTTPException
from typing import List
from app.crud import session as session_crud
from app.schemas.session import SessionCreate, SessionUpdate, SessionResponse

router = APIRouter()

# ---------------- Start Session ----------------
@router.post("/start", response_model=SessionResponse)
async def start_session(data: SessionCreate):
    try:
        session = await session_crud.start_session(data.dict())
        return session
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

# ---------------- End Session ----------------
@router.post("/end/{session_id}", response_model=SessionResponse)
async def end_session(session_id: str, update: SessionUpdate):
    try:
        session = await session_crud.end_session(session_id, update.end_time)
        return session
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
