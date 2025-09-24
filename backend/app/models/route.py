from pydantic import BaseModel, Field
from typing import List

class BusStop(BaseModel):
    name: str
    latitude: float
    longitude: float

class Location(BaseModel):
    name: str
    latitude: float
    longitude: float

class RouteModel(BaseModel):
    route_name: str = Field(..., description="Unique name of the route")
    source: Location
    destination: Location
    vehicle_id: str
    route_points: List[BusStop] = Field(default_factory=list)
    estimated_time: int
    route_geometry: List[dict] = Field(default_factory=list)  # road path
