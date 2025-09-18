from pydantic import BaseModel, Field
from typing import List, Dict

class RouteModel(BaseModel):
    route_name: str = Field(..., description="Unique name of the route")
    route_points: List[Dict[str, float]] = Field(
        ..., description="List of GPS points, each as {'latitude': float, 'longitude': float}"
    )
