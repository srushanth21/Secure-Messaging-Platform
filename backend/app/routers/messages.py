from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from typing import List
from app.database import get_db
from app.models.user import User
from app.models.message import Message
from app.models.conversation import ConversationMember
from app.middleware.auth import get_current_user
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

router = APIRouter(prefix="/api/conversations", tags=["messages"])

class MessageResponse(BaseModel):
    id: str
    conversation_id: str
    sender_id: str
    content: str
    message_type: str
    status: str
    reply_to_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}

@router.get("/{conv_id}/messages", response_model=List[MessageResponse])
async def get_messages(
    conv_id: str,
    limit: int = Query(50, le=100),
    before: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Verify membership
    member_stmt = select(ConversationMember).where(
        ConversationMember.conversation_id == conv_id,
        ConversationMember.user_id == current_user.id
    )
    if not (await db.execute(member_stmt)).scalar_one_or_none():
        raise HTTPException(status_code=403, detail="Not a member")
        
    stmt = (
        select(Message)
        .where(Message.conversation_id == conv_id)
        .order_by(desc(Message.created_at))
        .limit(limit)
    )
    
    if before:
        from datetime import datetime
        try:
            before_dt = datetime.fromisoformat(before.replace('Z', '+00:00'))
            stmt = stmt.where(Message.created_at < before_dt)
        except ValueError:
            pass
            
    result = await db.execute(stmt)
    # Return in chronological order (reverse the desc result)
    messages = list(result.scalars().all())
    messages.reverse()
    return messages
