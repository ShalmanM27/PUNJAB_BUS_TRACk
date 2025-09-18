# backend/app/utils/eta.py
from datetime import datetime, timedelta
from geopy.distance import geodesic

def compute_eta(current_lat, current_long, route_points):
    """
    Computes estimated time of arrival (ETA) based on the current location and route geometry.
    Uses geodesic distance to estimate time assuming an average speed.
    """
    if not route_points:
        raise ValueError("Route points are required for ETA computation")

    # Average speed in km/h, adjust as necessary
    AVERAGE_SPEED_KMH = 40

    # Current position
    current_pos = (current_lat, current_long)

    # Find the nearest route point
    min_distance = float('inf')
    nearest_point = None
    for point in route_points:
        distance = geodesic(current_pos, (point["latitude"], point["longitude"])).km
        if distance < min_distance:
            min_distance = distance
            nearest_point = point

    if not nearest_point:
        raise ValueError("Could not find the nearest route point")

    # Sum distance to remaining points
    total_distance = 0.0
    started = False
    last_point = None
    for point in route_points:
        if point == nearest_point:
            started = True
        if started:
            if last_point:
                total_distance += geodesic((last_point["latitude"], last_point["longitude"]), (point["latitude"], point["longitude"])).km
            last_point = point

    # Calculate ETA in minutes
    eta_minutes = (total_distance / AVERAGE_SPEED_KMH) * 60
    return round(eta_minutes)

# Example route_points format:
# route_points = [
#     {"latitude": 31.6340, "longitude": 74.8723},
#     {"latitude": 31.6350, "longitude": 74.8730},
#     ...
# ]
