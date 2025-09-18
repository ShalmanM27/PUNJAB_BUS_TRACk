import hashlib
from datetime import datetime

def generate_event_hash(event_data: dict) -> str:
    """
    Generate a SHA256 hash for an event using event data and timestamp.
    Ensures immutability and traceability of critical events.
    """
    # Sort the dictionary items to maintain consistency
    sorted_items = sorted(event_data.items())
    data_string = str(sorted_items) + str(datetime.utcnow().isoformat())
    return hashlib.sha256(data_string.encode('utf-8')).hexdigest()
