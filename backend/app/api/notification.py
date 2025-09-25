from fastapi import APIRouter, HTTPException, WebSocket, WebSocketDisconnect
from typing import List
from app.schemas.notification import NotificationResponse, NotificationCreate, NotificationUpdate
from app.crud import notification as notification_crud

router = APIRouter(
    prefix="/admin/notifications",
    tags=["notifications"]
)

# Store connected WebSocket clients
websocket_clients: List[WebSocket] = []

@router.websocket("/ws/notifications")
async def websocket_notifications(websocket: WebSocket):
    await websocket.accept()
    websocket_clients.append(websocket)
    try:
        while True:
            await websocket.receive_text()  # Keep the connection alive
    except WebSocketDisconnect:
        websocket_clients.remove(websocket)

# Helper to broadcast to all clients
async def broadcast_notification(notification):
    for ws in websocket_clients:
        try:
            await ws.send_json(notification)
        except Exception:
            pass  # Ignore failed sends

@router.get("/", response_model=List[NotificationResponse])
async def list_notifications():
    return await notification_crud.list_notifications()

@router.post("/", response_model=NotificationResponse)
async def create_notification(notification: NotificationCreate):
    notif = await notification_crud.create_notification(notification.dict())
    # Broadcast to WebSocket clients
    from fastapi.concurrency import run_in_threadpool
    import asyncio
    asyncio.create_task(broadcast_notification(notif))
    return notif

@router.patch("/{notification_id}", response_model=NotificationResponse)
async def update_notification(notification_id: str, update: NotificationUpdate):
    notif = await notification_crud.update_notification_status(notification_id, update.status)
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")
    return notif
