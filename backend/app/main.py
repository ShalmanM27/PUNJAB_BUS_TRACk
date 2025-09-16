from fastapi import FastAPI
from app.api import admin, driver, conductor, passenger

app = FastAPI(title="Punjab Bus Tracking Backend")

# Routers
app.include_router(admin.router, prefix="/admin", tags=["Admin"])
app.include_router(driver.router, prefix="/driver", tags=["Driver"])
app.include_router(conductor.router, prefix="/conductor", tags=["Conductor"])
app.include_router(passenger.router, prefix="/passenger", tags=["Passenger"])

@app.get("/")
async def root():
    return {"message": "Punjab Bus Tracking API is running"}
