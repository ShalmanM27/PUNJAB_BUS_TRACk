from fastapi import APIRouter
from app.schemas.user import PassengerCreate, PassengerResponse
from app.crud import passenger as passenger_crud

router = APIRouter()

# ---------------- Passenger self-registration ----------------
@router.post("/register", response_model=PassengerResponse)
async def register_passenger(passenger: PassengerCreate):
    return await passenger_crud.create_passenger(passenger.dict())
