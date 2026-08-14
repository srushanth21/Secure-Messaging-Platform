import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from app.database import async_session
from app.services.conversation_service import get_user_conversations, get_last_message_and_unread
from app.models.user import User
from sqlalchemy import select
from app.schemas.conversation import ConversationResponse

async def test():
    async with async_session() as db:
        user = (await db.execute(select(User).limit(1))).scalar_one_or_none()
        if not user:
            print("No users found")
            return
            
        print(f"Testing with user {user.username} ({user.id})")
        db_convs = await get_user_conversations(db, user.id)
        
        result = []
        for conv in db_convs:
            last_msg, unread_count = await get_last_message_and_unread(db, conv.id, user.id)
            
            conv_dict = {
                "id": conv.id,
                "type": conv.type,
                "name": conv.name,
                "avatar_url": conv.avatar_url,
                "created_by": conv.created_by,
                "created_at": conv.created_at,
                "updated_at": conv.updated_at,
                "members": conv.members,
                "unread_count": unread_count,
                "last_message": last_msg
            }
            try:
                # Try to parse with Pydantic
                parsed = ConversationResponse.model_validate(conv_dict)
                print(f"Conversation {conv.id} parsed successfully!")
            except Exception as e:
                print(f"Error parsing conversation {conv.id}:")
                print(e)
                
asyncio.run(test())
