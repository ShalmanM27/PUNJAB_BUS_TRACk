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
    source: Location = Field(..., description="Source location with coordinates")
    destination: Location = Field(..., description="Destination location with coordinates")
    vehicle_id: str = Field(..., description="Assigned vehicle id")
    route_points: List[BusStop] = Field(
        default_factory=list,
        description="List of intermediate bus stops, each with name, latitude, longitude"
    )
    estimated_time: int = Field(..., description="Estimated time in minutes from source to destination")
