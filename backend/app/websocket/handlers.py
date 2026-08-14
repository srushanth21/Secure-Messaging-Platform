from fastapi import WebSocket
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from datetime import datetime
from app.websocket.manager import manager
from app.models.conversation import Conversation, ConversationMember
from app.models.message import Message
import uuid

async def handle_ws_message(user_id: str, data: dict, db: AsyncSession):
    msg_type = data.get("type")
    
    if msg_type == "new_message":
        await handle_new_message(user_id, data, db)
    elif msg_type == "typing":
        await handle_typing(user_id, data, db)
    elif msg_type == "read_receipt":
        await handle_read_receipt(user_id, data, db)
    elif msg_type == "message_status":
        pass # Placeholder if clients send status updates

async def get_conversation_members(db: AsyncSession, conversation_id: str):
    stmt = select(ConversationMember.user_id).where(ConversationMember.conversation_id == conversation_id)
    result = await db.execute(stmt)
    return result.scalars().all()

async def handle_new_message(user_id: str, data: dict, db: AsyncSession):
    conv_id = data.get("conversation_id")
    content = data.get("content")
    
    # Save to db
    msg = Message(
        conversation_id=conv_id,
        sender_id=user_id,
        content=content,
        status="sent"
    )
    db.add(msg)
    
    # Update conversation's updated_at so sidebar ordering reflects latest activity
    conv = await db.get(Conversation, conv_id)
    if conv:
        conv.updated_at = datetime.utcnow()
    
    await db.commit()
    await db.refresh(msg)
    
    # Build payload
    payload = {
        "type": "new_message",
        "message": {
            "id": msg.id,
            "conversation_id": msg.conversation_id,
            "sender_id": msg.sender_id,
            "content": msg.content,
            "message_type": msg.message_type,
            "status": msg.status,
            "created_at": msg.created_at.isoformat(),
            "updated_at": msg.created_at.isoformat()
        }
    }
    
    # Broadcast
    member_ids = await get_conversation_members(db, conv_id)
    
    # Check who is online to mark as delivered
    delivered = False
    for m_id in member_ids:
        if m_id != user_id and m_id in manager.active_connections:
            delivered = True
            
    if delivered:
        msg.status = "delivered"
        payload["message"]["status"] = "delivered"
        await db.commit()
        
    # Send to everyone including sender (so sender gets the official DB version with ID/timestamp)
    await manager.broadcast_to_users(member_ids, payload)

async def handle_typing(user_id: str, data: dict, db: AsyncSession):
    conv_id = data.get("conversation_id")
    is_typing = data.get("is_typing", False)
    
    member_ids = await get_conversation_members(db, conv_id)
    payload = {
        "type": "typing",
        "conversation_id": conv_id,
        "user_id": user_id,
        "is_typing": is_typing
    }
    await manager.broadcast_to_users(member_ids, payload, exclude_user_id=user_id)

async def handle_read_receipt(user_id: str, data: dict, db: AsyncSession):
    from app.websocket.manager import manager
    msg_id = data.get("message_id")
    conv_id = data.get("conversation_id")
    
    if msg_id and conv_id:
        msg = await db.get(Message, msg_id)
        if msg:
            # Update all unread messages from others in this conversation up to this message
            stmt = select(Message).where(
                Message.conversation_id == conv_id,
                Message.sender_id != user_id,
                Message.status != "read",
                Message.created_at <= msg.created_at
            )
            unread_msgs = (await db.execute(stmt)).scalars().all()
            
            for m in unread_msgs:
                m.status = "read"
                # Notify sender for each read message
                payload = {
                    "type": "message_status",
                    "message_id": m.id,
                    "status": "read"
                }
                await manager.send_to_user(m.sender_id, payload)
        
        # Update last_read_at
        stmt = select(ConversationMember).where(
            ConversationMember.conversation_id == conv_id,
            ConversationMember.user_id == user_id
        )
        member = (await db.execute(stmt)).scalar_one_or_none()
        if member:
            member.last_read_at = datetime.utcnow()
            await db.commit()
