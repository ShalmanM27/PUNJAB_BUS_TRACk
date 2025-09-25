from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Import Routers
from app.api import (
    admin,
    driver,
    conductor,
    passenger,
    vehicle,
    device,
    telemetry,
    admin_assign,
    session,
    audit,
    route,
    drive_status,
    notification,
)

app = FastAPI(title="Punjab Bus Tracking API")

# ---------------- CORS ----------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # TODO: in production set only frontend URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------- Routers ----------------
app.include_router(admin.router, prefix="/admin", tags=["Admin"])
app.include_router(driver.router, prefix="/driver", tags=["Driver"])
app.include_router(conductor.router, prefix="/conductor", tags=["Conductor"])
app.include_router(passenger.router, prefix="/passenger", tags=["Passenger"])
app.include_router(vehicle.router, prefix="/vehicle", tags=["Vehicle"])
app.include_router(device.router, prefix="/device", tags=["Device"])
app.include_router(telemetry.router, prefix="/telemetry", tags=["Telemetry"])
app.include_router(admin_assign.router, prefix="/assign", tags=["Assignment"])
app.include_router(session.router, prefix="/session", tags=["Session"])
app.include_router(audit.router, prefix="/audit", tags=["Audit"])
app.include_router(route.router, prefix="/routes", tags=["Route"])
app.include_router(drive_status.router, prefix="/drive-status", tags=["drive-status"])
app.include_router(notification.router)


# ---------------- Health Check ----------------
@app.get("/health")
async def health_check():
    return {
        "status": "ok",
        "message": "Punjab Bus Tracking API is running",
    }


# ---------------- Admin Shortcuts ----------------
@app.get("/admin/devices")
async def admin_list_devices():
    from app.crud.device import list_devices

    return await list_devices()


@app.get("/admin/vehicles")
async def admin_list_vehicles():
    from app.crud.vehicle import list_vehicles

    return await list_vehicles()


@app.get("/admin/sessions")
async def admin_list_sessions():
    from app.crud.session import list_sessions

    return await list_sessions()


# ---------------- Run with Uvicorn ----------------
# uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
    return await list_sessions()


# ---------------- Run with Uvicorn ----------------
# uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
