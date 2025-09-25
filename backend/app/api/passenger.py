from fastapi import APIRouter, HTTPException, Body
from typing import List
from app.schemas.user import PassengerCreate, PassengerResponse
from app.crud import passenger as passenger_crud

router = APIRouter()

# ------------------- Self-registration (no admin needed) -------------------
@router.post("/register", response_model=PassengerResponse)
async def register_passenger(passenger: PassengerCreate):
    try:
        return await passenger_crud.create_passenger(passenger.dict())
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

# ------------------- Login endpoint -------------------
@router.post("/login", response_model=PassengerResponse)
async def login_passenger(
    phone: str = Body(...), password: str = Body(...)
):
    passenger = await passenger_crud.get_passenger_by_phone(phone)
    if not passenger or passenger.get("password") != password:
        raise HTTPException(status_code=401, detail="Incorrect phone or password")
    # Remove password before returning
    passenger.pop("password", None)
    return passenger

# ------------------- Admin-only endpoints -------------------
@router.get("/", response_model=List[PassengerResponse])
async def list_passengers():
    return await passenger_crud.list_passengers()

@router.get("/{passenger_id}", response_model=PassengerResponse)
async def get_passenger(passenger_id: str):
    passenger = await passenger_crud.get_passenger_by_id(passenger_id)
    if not passenger:
        raise HTTPException(status_code=404, detail="Passenger not found")
    return passenger

@router.delete("/{passenger_id}")
async def delete_passenger(passenger_id: str):
    result = await passenger_crud.delete_passenger(passenger_id)
    if not result:
        raise HTTPException(status_code=404, detail="Passenger not found")
    return {"detail": "Passenger deleted successfully"}
