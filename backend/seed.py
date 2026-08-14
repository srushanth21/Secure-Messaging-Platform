import asyncio
import uuid
from datetime import datetime, timedelta
from passlib.context import CryptContext
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession

from app.config import settings
from app.database import engine, async_session, Base
from app.models.user import User
from app.models.conversation import Conversation, ConversationMember
from app.models.message import Message
from app.models.contact import Contact

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

async def seed():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    
    async with async_session() as session:
        # Create users
        users_data = [
            {"username": "alice", "phone": "+1111111111", "display_name": "Alice"},
            {"username": "bob", "phone": "+2222222222", "display_name": "Bob"},
            {"username": "charlie", "phone": "+3333333333", "display_name": "Charlie"},
            {"username": "diana", "phone": "+4444444444", "display_name": "Diana"},
            {"username": "eve", "phone": "+5555555555", "display_name": "Eve"},
            {"username": "frank", "phone": "+6666666666", "display_name": "Frank"},
        ]
        
        users = {}
        for u in users_data:
            user = User(
                id=uuid.uuid4().hex,
                username=u["username"],
                phone=u["phone"],
                display_name=u["display_name"],
                password_hash=hash_password("password123"),
                is_online=False,
                last_seen=datetime.utcnow()
            )
            session.add(user)
            users[u["username"]] = user
        
        await session.commit()

        # Create contacts
        contacts = [
            ("alice", "bob", "Bob"), ("bob", "alice", "Alice"),
            ("alice", "charlie", "Charlie"), ("charlie", "alice", "Alice"),
            ("bob", "diana", "Diana"), ("diana", "bob", "Bob"),
            ("charlie", "eve", "Eve"), ("eve", "charlie", "Charlie")
        ]
        
        for u1_name, u2_name, nickname in contacts:
            contact = Contact(
                id=uuid.uuid4().hex,
                user_id=users[u1_name].id,
                contact_user_id=users[u2_name].id,
                nickname=nickname
            )
            session.add(contact)
        
        await session.commit()
        
        # Helper for DM
        async def create_dm(u1_name, u2_name, num_msgs):
            u1 = users[u1_name]
            u2 = users[u2_name]
            conv = Conversation(id=uuid.uuid4().hex, type="dm", created_by=u1.id)
            session.add(conv)
            
            m1 = ConversationMember(id=uuid.uuid4().hex, conversation_id=conv.id, user_id=u1.id)
            m2 = ConversationMember(id=uuid.uuid4().hex, conversation_id=conv.id, user_id=u2.id)
            session.add_all([m1, m2])
            
            # messages
            base_time = datetime.utcnow() - timedelta(days=7)
            for i in range(num_msgs):
                sender = u1 if i % 2 == 0 else u2
                msg_time = base_time + timedelta(hours=i)
                msg = Message(
                    id=uuid.uuid4().hex,
                    conversation_id=conv.id,
                    sender_id=sender.id,
                    content=f"DM message {i+1} between {u1_name} and {u2_name}",
                    created_at=msg_time,
                    updated_at=msg_time,
                    status="read" if i < num_msgs - 1 else "sent"
                )
                session.add(msg)
        
        await create_dm("alice", "bob", 30)
        await create_dm("alice", "charlie", 15)
        await create_dm("bob", "diana", 10)
        await create_dm("charlie", "eve", 5)
        
        # Helper for Group
        async def create_group(name, admin_name, member_names, num_msgs):
            admin = users[admin_name]
            conv = Conversation(id=uuid.uuid4().hex, type="group", name=name, created_by=admin.id)
            session.add(conv)
            
            members = [ConversationMember(id=uuid.uuid4().hex, conversation_id=conv.id, user_id=admin.id, role="admin")]
            for m_name in member_names:
                members.append(ConversationMember(id=uuid.uuid4().hex, conversation_id=conv.id, user_id=users[m_name].id, role="member"))
            
            session.add_all(members)
            
            base_time = datetime.utcnow() - timedelta(days=3)
            
            sys_msg = Message(
                id=uuid.uuid4().hex,
                conversation_id=conv.id,
                sender_id=admin.id,
                content=f"{admin.display_name} created the group '{name}'",
                message_type="system",
                created_at=base_time,
                updated_at=base_time
            )
            session.add(sys_msg)
            
            all_participants = [admin_name] + member_names
            for i in range(1, num_msgs):
                sender_name = all_participants[i % len(all_participants)]
                sender = users[sender_name]
                msg_time = base_time + timedelta(hours=i)
                msg = Message(
                    id=uuid.uuid4().hex,
                    conversation_id=conv.id,
                    sender_id=sender.id,
                    content=f"Group message {i} in {name} from {sender_name}",
                    created_at=msg_time,
                    updated_at=msg_time
                )
                session.add(msg)
        
        await create_group("Project Team", "alice", ["bob", "charlie", "diana"], 25)
        await create_group("Weekend Plans", "bob", ["alice", "eve", "frank"], 15)
        
        await session.commit()
        print("Database seeded successfully.")

if __name__ == "__main__":
    asyncio.run(seed())
