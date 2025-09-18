def is_valid_gps(lat: float, long: float) -> bool:
    """
    Validate if the given latitude and longitude are within acceptable ranges.
    Latitude must be between -90 and 90.
    Longitude must be between -180 and 180.
    """
    if lat is None or long is None:
        return False
    if not isinstance(lat, (int, float)) or not isinstance(long, (int, float)):
        return False
    if lat < -90.0 or lat > 90.0:
        return False
    if long < -180.0 or long > 180.0:
        return False
    return True
