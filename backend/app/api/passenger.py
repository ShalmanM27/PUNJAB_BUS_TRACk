from fastapi import APIRouter, HTTPException, Body, Query
from typing import List, Optional
from app.schemas.user import PassengerCreate, PassengerResponse
from app.crud import passenger as passenger_crud
from app.crud import route as route_crud
from app.crud import session as session_crud
from app.crud import telemetry as telemetry_crud
from app.crud import eta as eta_crud  # You will need to implement eta.py
from pydantic import BaseModel

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

# ------------------- Passenger endpoints -------------------
class SearchBusesRequest(BaseModel):
    destination: str
    bus_stop: Optional[str] = None
    current_lat: Optional[float] = None
    current_lng: Optional[float] = None

@router.post("/search-buses")
async def search_buses(req: SearchBusesRequest):
    """
    Main search endpoint for passenger to find upcoming buses.
    """
    # 1. Validate destination exists
    destination = req.destination
    bus_stop = req.bus_stop
    current_lat = req.current_lat
    current_lng = req.current_lng

    # Find all routes with this destination
    routes = await route_crud.find_routes_by_destination(destination)
    if not routes:
        return {"nearest_stop": None, "buses": []}

    # If bus_stop is provided, filter routes that pass through it
    if bus_stop:
        candidate_routes = [r for r in routes if any(s["name"] == bus_stop for s in r.get("route_points", []))]
        nearest_stop = bus_stop
    else:
        # Find nearest stop among all route_points in all routes
        if current_lat is None or current_lng is None:
            return {"detail": "current_lat and current_lng required if bus_stop not provided"}, 400
        nearest_stop, candidate_routes = await route_crud.find_nearest_stop_and_routes(routes, current_lat, current_lng)
        if not nearest_stop:
            return {"nearest_stop": None, "buses": []}
    # For each candidate route, find active sessions
    buses = []
    for route in candidate_routes:
        sessions = await session_crud.find_active_sessions_by_route(route["id"])
        for sess in sessions:
            telemetry = await telemetry_crud.get_latest_position(sess["id"])
            if not telemetry:
                continue
            eta_minutes = await eta_crud.compute_eta_to_stop(sess["id"], nearest_stop)
            driver_info = await session_crud.get_driver_info(sess["driver_id"])
            buses.append({
                "vehicle_id": sess["vehicle_id"],
                "route_name": route["route_name"],
                "driver": driver_info.get("name") if driver_info else None,
                "eta_minutes": eta_minutes,
                "current_lat": telemetry.get("latitude"),
                "current_lng": telemetry.get("longitude"),
            })
    return {"nearest_stop": nearest_stop, "buses": buses}

@router.get("/nearest-stop")
async def nearest_stop(
    lat: float = Query(...), lng: float = Query(...)
):
    """
    Helper to find nearest bus stop to a coordinate.
    """
    stop, _ = await route_crud.find_nearest_stop_and_routes(await route_crud.list_routes(), lat, lng)
    return {"nearest_stop": stop}

@router.get("/eta/{session_id}/{stop_name}")
async def eta(session_id: str, stop_name: str):
    """
    Returns ETA for a particular bus to a stop.
    """
    eta_minutes = await eta_crud.compute_eta_to_stop(session_id, stop_name)
    return {"session_id": session_id, "stop_name": stop_name, "eta_minutes": eta_minutes}

@router.put("/{passenger_id}", response_model=PassengerResponse)
async def update_passenger(passenger_id: str, data: dict = Body(...)):
    passenger = await passenger_crud.get_passenger_by_id(passenger_id)
    if not passenger:
        raise HTTPException(status_code=404, detail="Passenger not found")
    # Prevent updating password here for simplicity
    data.pop("password", None)
    updated = await passenger_crud.update_passenger(passenger_id, data)
    if not updated:
        raise HTTPException(status_code=400, detail="Update failed")
    updated.pop("password", None)
    return updated
