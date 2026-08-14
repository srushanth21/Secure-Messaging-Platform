import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from app.database import async_session
from app.models.user import User
from app.models.conversation import Conversation
from sqlalchemy import select
from app.routers.messages import get_messages, MessageResponse

async def test():
    async with async_session() as db:
        user = (await db.execute(select(User).limit(1))).scalar_one_or_none()
        conv = (await db.execute(select(Conversation).limit(1))).scalar_one_or_none()
        
        if not user or not conv:
            print("No users or convs found")
            return
            
        print(f"Testing with conv {conv.id}")
        
        # Test the endpoint logic directly
        try:
            messages = await get_messages(conv_id=conv.id, limit=10, before=None, current_user=user, db=db)
            print(f"Got {len(messages)} messages from DB")
            
            for msg in messages:
                # Try to parse with Pydantic
                parsed = MessageResponse.model_validate(msg)
            print("All messages parsed successfully!")
        except Exception as e:
            print(f"Error parsing messages:")
            print(e)
            
asyncio.run(test())
