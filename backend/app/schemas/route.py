from pydantic import BaseModel, Field
from typing import List, Dict, Optional

class RouteCreate(BaseModel):
    route_name: str
    source: str
    destination: str
    vehicle_id: str
    route_points: List[Dict[str, float]]
    estimated_time: int  # in minutes

class RouteUpdate(BaseModel):
    route_name: Optional[str]
    source: Optional[str]
    destination: Optional[str]
    vehicle_id: Optional[str]
    route_points: Optional[List[Dict[str, float]]]
    estimated_time: Optional[int]

class RouteResponse(BaseModel):
    id: str
    route_name: str
    source: str
    destination: str
    vehicle_id: str
    route_points: List[Dict[str, float]]
    estimated_time: int
