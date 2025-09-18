from pydantic import BaseModel, Field
from typing import List, Dict, Optional

class RouteCreate(BaseModel):
    route_name: str
    route_points: List[Dict[str, float]]

class RouteUpdate(BaseModel):
    route_name: Optional[str]
    route_points: Optional[List[Dict[str, float]]]

class RouteResponse(BaseModel):
    id: str
    route_name: str
    route_points: List[Dict[str, float]]
