from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from app.schemas.user import UserResponse

class MessagePreview(BaseModel):
    id: str
    content: str
    message_type: str
    status: str
    created_at: datetime
    sender_id: str

    model_config = {"from_attributes": True}

class ConversationMemberResponse(BaseModel):
    id: str
    user_id: str
    role: str
    joined_at: datetime
    last_read_at: Optional[datetime] = None
    user: UserResponse

    model_config = {"from_attributes": True}

class ConversationResponse(BaseModel):
    id: str
    type: str
    name: Optional[str] = None
    avatar_url: Optional[str] = None
    created_by: str
    created_at: datetime
    updated_at: datetime
    
    # We will populate these manually in the service
    members: List[ConversationMemberResponse] = []
    last_message: Optional[MessagePreview] = None
    unread_count: int = 0

    model_config = {"from_attributes": True}

class CreateGroupRequest(BaseModel):
    name: str
    member_ids: List[str]

class UpdateGroupRequest(BaseModel):
    name: Optional[str] = None
    avatar_url: Optional[str] = None

class AddMembersRequest(BaseModel):
    member_ids: List[str]
