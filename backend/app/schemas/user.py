from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class RegisterRequest(BaseModel):
    username: str
    phone: Optional[str] = None
    password: str

class VerifyOTPRequest(BaseModel):
    username: str
    otp: str

class LoginRequest(BaseModel):
    username: str
    password: str

class ProfileUpdateRequest(BaseModel):
    display_name: Optional[str] = None
    status_text: Optional[str] = None

class UserResponse(BaseModel):
    id: str
    username: str
    phone: Optional[str] = None
    display_name: str
    avatar_url: Optional[str] = None
    status_text: Optional[str] = None
    last_seen: datetime
    is_online: bool
    created_at: datetime

    model_config = {"from_attributes": True}

class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
