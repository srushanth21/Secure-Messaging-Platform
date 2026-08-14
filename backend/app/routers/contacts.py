from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from typing import List
from app.database import get_db
from app.models.user import User
from app.models.contact import Contact
from app.schemas.contact import AddContactRequest, ContactResponse
from app.middleware.auth import get_current_user

router = APIRouter(prefix="/api/contacts", tags=["contacts"])

@router.get("", response_model=List[ContactResponse])
async def get_contacts(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = (
        select(Contact)
        .where(Contact.user_id == current_user.id)
        .options(selectinload(Contact.contact_user))
    )
    result = await db.execute(stmt)
    return result.scalars().all()

@router.post("", response_model=ContactResponse)
async def add_contact(
    req: AddContactRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Find user
    result = await db.execute(select(User).where(User.username == req.username))
    target_user = result.scalar_one_or_none()
    
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")
        
    if target_user.id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot add yourself")
        
    # Check if already contact
    check = await db.execute(select(Contact).where(
        Contact.user_id == current_user.id,
        Contact.contact_user_id == target_user.id
    ))
    if check.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Already in contacts")
        
    contact = Contact(
        user_id=current_user.id,
        contact_user_id=target_user.id
    )
    db.add(contact)
    await db.commit()
    await db.refresh(contact)
    
    # Manually attach relationship to avoid lazy load error
    contact.contact_user = target_user
    
    return contact
