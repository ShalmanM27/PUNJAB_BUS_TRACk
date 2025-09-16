from fastapi import APIRouter

router = APIRouter()

@router.get("/")
async def conductor_root():
    return {"message": "Conductor endpoint"}
