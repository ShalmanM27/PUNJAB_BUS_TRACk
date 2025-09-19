from pydantic import BaseModel, Field
from typing import List, Optional

class BusStop(BaseModel):
    name: str
    latitude: float
    longitude: float

class Location(BaseModel):
    name: str
    latitude: float
    longitude: float

class RouteCreate(BaseModel):
    route_name: str
    source: Location
    destination: Location
    vehicle_id: str
    route_points: List[BusStop] = []  # List of intermediate stops (can be empty)
    estimated_time: int  # in minutes

class RouteUpdate(BaseModel):
    route_name: Optional[str]
    source: Optional[Location]
    destination: Optional[Location]
    vehicle_id: Optional[str]
    route_points: Optional[List[BusStop]]
    estimated_time: Optional[int]

class RouteResponse(BaseModel):
    id: str
    route_name: str
    source: Location
    destination: Location
    vehicle_id: str
    route_points: List[BusStop]
    estimated_time: int
