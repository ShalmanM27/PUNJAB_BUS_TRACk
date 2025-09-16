from pydantic import BaseModel
from typing import List, Optional

class Stop(BaseModel):
    name: str
    latitude: float
    longitude: float

class Route(BaseModel):
    id: Optional[str]
    name: str
    stops: List[Stop]
