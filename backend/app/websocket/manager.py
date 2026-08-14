from fastapi import WebSocket
from typing import Dict, List
import logging

logger = logging.getLogger(__name__)

class ConnectionManager:
    def __init__(self):
        # Maps user_id to their active WebSocket connection
        self.active_connections: Dict[str, WebSocket] = {}

    async def connect(self, user_id: str, websocket: WebSocket):
        await websocket.accept()
        self.active_connections[user_id] = websocket
        logger.info(f"User {user_id} connected via WebSocket")
        
        # Broadcast online status to others
        await self.broadcast_to_users(list(self.active_connections.keys()), {
            "type": "user_online",
            "user_id": user_id,
            "is_online": True
        }, exclude_user_id=user_id)

    def disconnect(self, user_id: str):
        if user_id in self.active_connections:
            del self.active_connections[user_id]
            logger.info(f"User {user_id} disconnected")
            
            # Broadcast offline status to others (fire and forget using asyncio)
            import asyncio
            for u_id, conn in self.active_connections.items():
                asyncio.create_task(conn.send_json({
                    "type": "user_online",
                    "user_id": user_id,
                    "is_online": False
                }))

    async def send_to_user(self, user_id: str, data: dict):
        if user_id in self.active_connections:
            try:
                await self.active_connections[user_id].send_json(data)
            except Exception as e:
                logger.error(f"Error sending to {user_id}: {e}")
                self.disconnect(user_id)

    async def broadcast_to_users(self, user_ids: List[str], data: dict, exclude_user_id: str = None):
        for user_id in user_ids:
            if user_id != exclude_user_id:
                await self.send_to_user(user_id, data)

manager = ConnectionManager()
