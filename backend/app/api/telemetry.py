from fastapi import APIRouter

router = APIRouter()

@router.post("/send")
async def send_telemetry():
    return {"message": "Telemetry received"}
