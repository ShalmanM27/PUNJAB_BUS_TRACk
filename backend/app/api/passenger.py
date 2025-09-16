from fastapi import APIRouter, HTTPException
from app.schemas.user import PassengerCreate, PassengerResponse
from app.crud import passenger as passenger_crud

router = APIRouter()

@router.post("/register", response_model=PassengerResponse)
async def register_passenger(passenger: PassengerCreate):
    """
    Self-register passenger without admin approval
    """
    try:
        return await passenger_crud.create_passenger(passenger.dict())
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
