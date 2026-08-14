from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_
from typing import List
from app.database import get_db
from app.models.user import User
from app.schemas.user import UserResponse
from app.middleware.auth import get_current_user

router = APIRouter(prefix="/api/users", tags=["users"])

@router.get("/search", response_model=List[UserResponse])
async def search_users(
    q: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if len(q) < 2:
        return []
        
    stmt = (
        select(User)
        .where(
            or_(
                User.username.ilike(f"%{q}%"),
                User.display_name.ilike(f"%{q}%")
            ),
            User.id != current_user.id
        )
        .limit(10)
    )
    result = await db.execute(stmt)
    return result.scalars().all()
