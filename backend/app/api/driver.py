from fastapi import APIRouter

router = APIRouter()

@router.get("/")
async def driver_root():
    return {"message": "Driver endpoint"}
