from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Import Routers
from app.api import admin, driver, conductor, passenger, vehicle, device, telemetry, admin_assign, session, audit

app = FastAPI(title="Punjab Bus Tracking API")

# ---------------- CORS ----------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # production: set frontend URLs
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

# ---------------- Health Check ----------------
@app.get("/health")
async def health_check():
    from app.config import w3, contract, RPC_URL
    blockchain_status = "connected" if w3.is_connected() else "disconnected"
    contract_status = "loaded" if contract else "not_loaded"
    return {
        "status": "ok",
        "blockchain": blockchain_status,
        "contract": contract_status,
        "rpc_url": RPC_URL,
        "message": "Punjab Bus Tracking API is running"
    }

# ---------------- Run with Uvicorn ----------------
# uvicorn main:app --reload --host 0.0.0.0 --port 8000
