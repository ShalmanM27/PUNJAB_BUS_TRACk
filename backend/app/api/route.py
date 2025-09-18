from fastapi import APIRouter, HTTPException
from typing import List
from app.schemas.route import RouteCreate, RouteResponse, RouteUpdate
from app.crud import route as route_crud

router = APIRouter()

# ---------------- Create Route ----------------
@router.post("/", response_model=RouteResponse)
async def create_route(route: RouteCreate):
    try:
        return await route_crud.create_route(route.dict())
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

# ---------------- List Routes ----------------
@router.get("/", response_model=List[RouteResponse])
async def list_routes():
    return await route_crud.list_routes()

# ---------------- Get Route by ID ----------------
@router.get("/{route_id}", response_model=RouteResponse)
async def get_route(route_id: str):
    route = await route_crud.get_route_by_id(route_id)
    if not route:
        raise HTTPException(status_code=404, detail="Route not found")
    return route

# ---------------- Update Route ----------------
@router.put("/{route_id}", response_model=RouteResponse)
async def update_route(route_id: str, route_update: RouteUpdate):
    try:
        updated = await route_crud.update_route(route_id, route_update.dict(exclude_unset=True))
        if not updated:
            raise HTTPException(status_code=404, detail="Route not found")
        return updated
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

# ---------------- Delete Route ----------------
@router.delete("/{route_id}")
async def delete_route(route_id: str):
    deleted = await route_crud.delete_route(route_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Route not found")
    return {"message": "Route deleted successfully"}
