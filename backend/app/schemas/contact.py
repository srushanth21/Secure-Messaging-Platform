from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.schemas.user import UserResponse

class AddContactRequest(BaseModel):
    username: str

class ContactResponse(BaseModel):
    id: str
    user_id: str
    contact_user_id: str
    nickname: Optional[str] = None
    created_at: datetime
    contact_user: UserResponse

    model_config = {"from_attributes": True}
