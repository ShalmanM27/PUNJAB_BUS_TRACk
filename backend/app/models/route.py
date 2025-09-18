from pydantic import BaseModel, Field
from typing import List, Dict

class RouteModel(BaseModel):
    route_name: str = Field(..., description="Unique name of the route")
    source: str = Field(..., description="Source location")
    destination: str = Field(..., description="Destination location")
    vehicle_id: str = Field(..., description="Assigned vehicle id")
    route_points: List[Dict[str, float]] = Field(
        ..., description="List of GPS points, each as {'latitude': float, 'longitude': float}"
    )
    estimated_time: int = Field(..., description="Estimated time in minutes from source to destination")
