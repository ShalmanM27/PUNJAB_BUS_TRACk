from fastapi import FastAPI
from app.api import admin, driver, conductor, passenger, device, vehicle, session, telemetry, audit

app = FastAPI(title="Punjab Bus Tracking Backend")

# Include routers
app.include_router(admin.router, prefix="/admin", tags=["Admin"])
app.include_router(driver.router, prefix="/driver", tags=["Driver"])
app.include_router(conductor.router, prefix="/conductor", tags=["Conductor"])
app.include_router(passenger.router, prefix="/passenger", tags=["Passenger"])
app.include_router(device.router, prefix="/device", tags=["Device"])
app.include_router(vehicle.router, prefix="/vehicle", tags=["Vehicle"])
app.include_router(session.router, prefix="/session", tags=["Session"])
app.include_router(telemetry.router, prefix="/telemetry", tags=["Telemetry"])
app.include_router(audit.router, prefix="/audit", tags=["Audit"])

@app.get("/")
async def root():
    return {"message": "Punjab Bus Tracking API is running"}