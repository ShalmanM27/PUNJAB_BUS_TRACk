from app.crud import session as session_crud
from app.crud import route as route_crud
from app.crud import telemetry as telemetry_crud
from geopy.distance import geodesic

async def compute_eta_to_stop(session_id, stop_name):
    """
    Compute ETA in minutes from latest telemetry to the given stop.
    """
    session = await session_crud.get_session_by_id(str(session_id))
    if not session:
        return None
    route = await route_crud.get_route_by_id(str(session["route_id"]))
    if not route:
        return None
    stop = next((s for s in route["route_points"] if s["name"] == stop_name), None)
    if not stop:
        return None
    telemetry = await telemetry_crud.get_latest_position(str(session_id))
    if not telemetry:
        return None
    # Compute distance
    curr = (telemetry["latitude"], telemetry["longitude"])
    dest = (stop["latitude"], stop["longitude"])
    distance_m = geodesic(curr, dest).meters
    speed_kmh = telemetry.get("speed", 20) or 20  # fallback to 20 km/h
    speed_ms = speed_kmh * 1000 / 3600
    if speed_ms <= 0:
        return None
    eta_minutes = int(distance_m / speed_ms / 60)
    return eta_minutes
