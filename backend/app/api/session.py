from fastapi import APIRouter
from typing import List
from app.schemas.session import SessionCreate, SessionEnd, SessionResponse
from app.crud import session as session_crud

router = APIRouter()

@router.post("/", response_model=SessionResponse)
async def create_session(session: SessionCreate):
    return await session_crud.create_session(session.dict())

@router.post("/end", response_model=SessionResponse)
async def end_session(session: SessionEnd):
    return await session_crud.end_session(session.session_id)

@router.get("/", response_model=List[SessionResponse])
async def list_sessions():
    return await session_crud.list_sessions()
