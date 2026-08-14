import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime
from sqlalchemy.orm import relationship
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=lambda: uuid.uuid4().hex)
    username = Column(String(50), unique=True, nullable=False, index=True)
    phone = Column(String(20), unique=True, nullable=True)
    display_name = Column(String(100), nullable=False)
    avatar_url = Column(String(500), nullable=True)
    password_hash = Column(String(255), nullable=False)
    status_text = Column(String(200), nullable=True, default="Hey there! I am using Signal.")
    last_seen = Column(DateTime, default=datetime.utcnow)
    is_online = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    sent_messages = relationship("Message", back_populates="sender", foreign_keys="Message.sender_id")
    conversations = relationship("ConversationMember", back_populates="user")
    contacts = relationship("Contact", back_populates="user", foreign_keys="Contact.user_id")
