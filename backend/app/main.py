from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import init_db, async_session
from app.services.auth_service import decode_token
from app.websocket.manager import manager
from app.websocket.handlers import handle_ws_message
import json

@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield

app = FastAPI(lifespan=lifespan)

import os
frontend_url = os.getenv("FRONTEND_URL", "https://secure-messaging-platform-frontend.onrender.com")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", frontend_url],
    allow_origin_regex=r"https://.*\.onrender\.com",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from app.routers import auth, conversations, contacts, users, messages
app.include_router(auth.router)
app.include_router(conversations.router)
app.include_router(contacts.router)
app.include_router(users.router)
app.include_router(messages.router)

@app.get("/api/health")
async def health_check():
    return {"status": "ok"}

@app.websocket("/ws/{token}")
async def websocket_endpoint(websocket: WebSocket, token: str):
    payload = decode_token(token)
    if not payload or "sub" not in payload:
        await websocket.close(code=1008)
        return
        
    user_id = payload["sub"]
    await manager.connect(user_id, websocket)
    
    try:
        while True:
            data = await websocket.receive_text()
            try:
                json_data = json.loads(data)
                async with async_session() as db:
                    await handle_ws_message(user_id, json_data, db)
            except json.JSONDecodeError:
                pass
            except Exception as e:
                import logging
                logging.error(f"WS error handling message: {e}")
                
    except WebSocketDisconnect:
        manager.disconnect(user_id)
