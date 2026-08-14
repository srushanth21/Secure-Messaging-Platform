from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, and_, desc
from sqlalchemy.orm import selectinload
from app.models.conversation import Conversation, ConversationMember
from app.models.message import Message
from app.models.user import User
import uuid
from typing import List, Tuple

async def get_user_conversations(db: AsyncSession, user_id: str) -> List[Conversation]:
    # Find all conversations the user is a member of
    stmt = (
        select(Conversation)
        .join(ConversationMember)
        .where(ConversationMember.user_id == user_id)
        .options(
            selectinload(Conversation.members).selectinload(ConversationMember.user),
        )
        .order_by(desc(Conversation.updated_at))
    )
    result = await db.execute(stmt)
    conversations = result.scalars().all()
    return conversations

async def get_last_message_and_unread(db: AsyncSession, conv_id: str, user_id: str) -> Tuple[Message, int]:
    # Last message
    last_msg_stmt = (
        select(Message)
        .where(Message.conversation_id == conv_id)
        .order_by(desc(Message.created_at))
        .limit(1)
    )
    last_msg = (await db.execute(last_msg_stmt)).scalar_one_or_none()
    
    # Get user's last_read_at
    member_stmt = select(ConversationMember).where(
        ConversationMember.conversation_id == conv_id,
        ConversationMember.user_id == user_id
    )
    member = (await db.execute(member_stmt)).scalar_one_or_none()
    
    unread_count = 0
    if member and member.last_read_at:
        unread_stmt = select(Message).where(
            Message.conversation_id == conv_id,
            Message.created_at > member.last_read_at,
            Message.sender_id != user_id
        )
        unread_result = await db.execute(unread_stmt)
        unread_count = len(unread_result.scalars().all())
    elif member: # never read anything
        unread_stmt = select(Message).where(
            Message.conversation_id == conv_id,
            Message.sender_id != user_id
        )
        unread_result = await db.execute(unread_stmt)
        unread_count = len(unread_result.scalars().all())
        
    return last_msg, unread_count

async def get_or_create_dm(db: AsyncSession, user1_id: str, user2_id: str) -> Conversation:
    # Look for existing DM
    stmt = (
        select(Conversation)
        .join(ConversationMember, Conversation.id == ConversationMember.conversation_id)
        .where(
            Conversation.type == "dm",
            Conversation.id.in_(
                select(ConversationMember.conversation_id)
                .where(ConversationMember.user_id == user1_id)
            ),
            Conversation.id.in_(
                select(ConversationMember.conversation_id)
                .where(ConversationMember.user_id == user2_id)
            )
        )
        .options(selectinload(Conversation.members).selectinload(ConversationMember.user))
    )
    existing = (await db.execute(stmt)).scalars().unique().first()
    if existing:
        return existing
        
    # Create new
    conv = Conversation(type="dm", created_by=user1_id)
    db.add(conv)
    await db.flush()
    
    m1 = ConversationMember(conversation_id=conv.id, user_id=user1_id)
    m2 = ConversationMember(conversation_id=conv.id, user_id=user2_id)
    db.add_all([m1, m2])
    await db.commit()
    
    # Reload with members
    stmt = select(Conversation).where(Conversation.id == conv.id).options(
        selectinload(Conversation.members).selectinload(ConversationMember.user)
    ).execution_options(populate_existing=True)
    return (await db.execute(stmt)).scalar_one()
