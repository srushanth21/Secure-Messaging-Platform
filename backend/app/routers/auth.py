from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models.user import User
from app.schemas.user import (
    RegisterRequest, VerifyOTPRequest, LoginRequest,
    ProfileUpdateRequest, UserResponse, AuthResponse
)
from app.services.auth_service import hash_password, verify_password, create_access_token
from app.middleware.auth import get_current_user
from app.config import settings
from datetime import datetime

router = APIRouter(prefix="/api/auth", tags=["auth"])

@router.post("/register", response_model=UserResponse)
async def register(req: RegisterRequest, db: AsyncSession = Depends(get_db)):
    # Check if username exists
    result = await db.execute(select(User).where(User.username == req.username))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Username already taken")
    
    # Check phone uniqueness if provided
    if req.phone:
        result = await db.execute(select(User).where(User.phone == req.phone))
        if result.scalar_one_or_none():
            raise HTTPException(status_code=400, detail="Phone number already registered")
    
    user = User(
        username=req.username,
        phone=req.phone,
        display_name=req.username,  # default display name
        password_hash=hash_password(req.password)
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user

@router.post("/verify-otp", response_model=AuthResponse)
async def verify_otp(req: VerifyOTPRequest, db: AsyncSession = Depends(get_db)):
    # Fixed OTP check
    if req.otp != settings.OTP_CODE:
        raise HTTPException(status_code=400, detail="Invalid OTP")
    
    result = await db.execute(select(User).where(User.username == req.username))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    token = create_access_token({"sub": user.id})
    return AuthResponse(access_token=token, user=UserResponse.model_validate(user))

@router.post("/login", response_model=AuthResponse)
async def login(req: LoginRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.username == req.username))
    user = result.scalar_one_or_none()
    if not user or not verify_password(req.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Update online status
    user.is_online = True
    user.last_seen = datetime.utcnow()
    await db.commit()
    
    token = create_access_token({"sub": user.id})
    return AuthResponse(access_token=token, user=UserResponse.model_validate(user))

@router.put("/profile", response_model=UserResponse)
async def update_profile(
    req: ProfileUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if req.display_name is not None:
        current_user.display_name = req.display_name
    if req.status_text is not None:
        current_user.status_text = req.status_text
    await db.commit()
    await db.refresh(current_user)
    return current_user

@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.post("/logout")
async def logout(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    current_user.is_online = False
    current_user.last_seen = datetime.utcnow()
    await db.commit()
    return {"message": "Logged out"}
