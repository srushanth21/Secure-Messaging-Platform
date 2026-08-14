import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey, Index, UniqueConstraint
from sqlalchemy.orm import relationship
from app.database import Base

class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(String, primary_key=True, default=lambda: uuid.uuid4().hex)
    type = Column(String(10), nullable=False) # dm or group
    name = Column(String(100), nullable=True)
    avatar_url = Column(String(500), nullable=True)
    created_by = Column(String, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    members = relationship("ConversationMember", back_populates="conversation")
    messages = relationship("Message", back_populates="conversation")
    creator = relationship("User", foreign_keys=[created_by])

class ConversationMember(Base):
    __tablename__ = "conversation_members"

    id = Column(String, primary_key=True, default=lambda: uuid.uuid4().hex)
    conversation_id = Column(String, ForeignKey("conversations.id"), nullable=False)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    role = Column(String(10), default="member")
    joined_at = Column(DateTime, default=datetime.utcnow)
    last_read_at = Column(DateTime, nullable=True)

    __table_args__ = (
        Index("ix_conversation_members_conversation_id", "conversation_id"),
        Index("ix_conversation_members_user_id", "user_id"),
        UniqueConstraint("conversation_id", "user_id", name="uq_conv_user"),
    )

    conversation = relationship("Conversation", back_populates="members")
    user = relationship("User", back_populates="conversations")
