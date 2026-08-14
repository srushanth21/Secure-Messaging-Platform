from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from typing import List
from app.database import get_db
from app.models.user import User
from app.models.conversation import Conversation
from app.schemas.conversation import ConversationResponse, CreateGroupRequest, UpdateGroupRequest, AddMembersRequest
from app.middleware.auth import get_current_user
from app.services.conversation_service import get_user_conversations, get_last_message_and_unread, get_or_create_dm
from app.models.message import Message
from app.models.conversation import Conversation, ConversationMember
from sqlalchemy import select

router = APIRouter(prefix="/api/conversations", tags=["conversations"])

@router.get("", response_model=List[ConversationResponse])
async def get_conversations(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    db_convs = await get_user_conversations(db, current_user.id)
    
    result = []
    for conv in db_convs:
        last_msg, unread_count = await get_last_message_and_unread(db, conv.id, current_user.id)
        
        # We need to manually build the Pydantic model because of the extra fields
        conv_dict = {
            "id": conv.id,
            "type": conv.type,
            "name": conv.name,
            "avatar_url": conv.avatar_url,
            "created_by": conv.created_by,
            "created_at": conv.created_at,
            "updated_at": conv.updated_at,
            "members": conv.members,
            "unread_count": unread_count,
            "last_message": last_msg
        }
        result.append(conv_dict)
        
    return result

@router.post("/dm/{user_id}", response_model=ConversationResponse)
async def create_dm(
    user_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot DM yourself")
        
    conv = await get_or_create_dm(db, current_user.id, user_id)
    last_msg, unread_count = await get_last_message_and_unread(db, conv.id, current_user.id)
    
    conv_dict = {
        "id": conv.id,
        "type": conv.type,
        "name": conv.name,
        "avatar_url": conv.avatar_url,
        "created_by": conv.created_by,
        "created_at": conv.created_at,
        "updated_at": conv.updated_at,
        "members": conv.members,
        "unread_count": unread_count,
        "last_message": last_msg
    }
    return conv_dict

@router.post("/group", response_model=ConversationResponse)
async def create_group(
    req: CreateGroupRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if not req.name.strip():
        raise HTTPException(status_code=400, detail="Group name required")
        
    conv = Conversation(type="group", name=req.name, created_by=current_user.id)
    db.add(conv)
    await db.flush()
    
    # Add creator as admin
    members = [ConversationMember(conversation_id=conv.id, user_id=current_user.id, role="admin")]
    
    # Add others as members
    for user_id in set(req.member_ids):
        if user_id != current_user.id:
            members.append(ConversationMember(conversation_id=conv.id, user_id=user_id, role="member"))
            
    db.add_all(members)
    
    # System message
    sys_msg = Message(
        conversation_id=conv.id,
        sender_id=current_user.id,
        content=f"{current_user.display_name} created the group '{req.name}'",
        message_type="system"
    )
    db.add(sys_msg)
    
    await db.commit()
    
    # Reload
    stmt = select(Conversation).where(Conversation.id == conv.id).options(
        selectinload(Conversation.members).selectinload(ConversationMember.user)
    ).execution_options(populate_existing=True)
    loaded = (await db.execute(stmt)).scalar_one()
    
    last_msg, unread_count = await get_last_message_and_unread(db, conv.id, current_user.id)
    
    conv_dict = {
        "id": loaded.id,
        "type": loaded.type,
        "name": loaded.name,
        "avatar_url": loaded.avatar_url,
        "created_by": loaded.created_by,
        "created_at": loaded.created_at,
        "updated_at": loaded.updated_at,
        "members": loaded.members,
        "unread_count": unread_count,
        "last_message": last_msg
    }
    return conv_dict

@router.put("/{conv_id}", response_model=ConversationResponse)
async def update_group(
    conv_id: str,
    req: UpdateGroupRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Verify admin
    member_stmt = select(ConversationMember).where(
        ConversationMember.conversation_id == conv_id,
        ConversationMember.user_id == current_user.id
    )
    member = (await db.execute(member_stmt)).scalar_one_or_none()
    
    if not member or member.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
        
    stmt = select(Conversation).where(Conversation.id == conv_id).options(
        selectinload(Conversation.members).selectinload(ConversationMember.user)
    ).execution_options(populate_existing=True)
    conv = (await db.execute(stmt)).scalar_one_or_none()
    if not conv or conv.type != "group":
        raise HTTPException(status_code=404, detail="Group not found")
        
    if req.name is not None:
        conv.name = req.name
    if req.avatar_url is not None:
        conv.avatar_url = req.avatar_url
        
    # System msg for name change
    if req.name is not None:
        sys_msg = Message(
            conversation_id=conv.id,
            sender_id=current_user.id,
            content=f"{current_user.display_name} changed the group name to '{req.name}'",
            message_type="system"
        )
        db.add(sys_msg)
        
    await db.commit()
    await db.refresh(conv)
    
    last_msg, unread_count = await get_last_message_and_unread(db, conv.id, current_user.id)
    
    conv_dict = {
        "id": conv.id,
        "type": conv.type,
        "name": conv.name,
        "avatar_url": conv.avatar_url,
        "created_by": conv.created_by,
        "created_at": conv.created_at,
        "updated_at": conv.updated_at,
        "members": conv.members,
        "unread_count": unread_count,
        "last_message": last_msg
    }
    return conv_dict

@router.post("/{conv_id}/members", response_model=ConversationResponse)
async def add_group_members(
    conv_id: str,
    req: AddMembersRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Verify admin
    member_stmt = select(ConversationMember).where(
        ConversationMember.conversation_id == conv_id,
        ConversationMember.user_id == current_user.id
    )
    member = (await db.execute(member_stmt)).scalar_one_or_none()
    
    if not member or member.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
        
    stmt = select(Conversation).where(Conversation.id == conv_id).options(
        selectinload(Conversation.members).selectinload(ConversationMember.user)
    ).execution_options(populate_existing=True)
    conv = (await db.execute(stmt)).scalar_one_or_none()
    
    if not conv or conv.type != "group":
        raise HTTPException(status_code=404, detail="Group not found")
        
    existing_member_ids = {m.user_id for m in conv.members}
    new_members = []
    added_names = []
    
    for user_id in req.member_ids:
        if user_id not in existing_member_ids:
            # check if user exists
            u_stmt = select(User).where(User.id == user_id)
            u = (await db.execute(u_stmt)).scalar_one_or_none()
            if u:
                new_members.append(ConversationMember(conversation_id=conv.id, user_id=user_id, role="member"))
                added_names.append(u.display_name)
                
    if not new_members:
        raise HTTPException(status_code=400, detail="No valid new members to add")
        
    db.add_all(new_members)
    
    # System message
    sys_msg = Message(
        conversation_id=conv.id,
        sender_id=current_user.id,
        content=f"{current_user.display_name} added {', '.join(added_names)} to the group",
        message_type="system"
    )
    db.add(sys_msg)
    
    await db.commit()
    
    # Reload
    stmt = select(Conversation).where(Conversation.id == conv.id).options(
        selectinload(Conversation.members).selectinload(ConversationMember.user)
    ).execution_options(populate_existing=True)
    loaded = (await db.execute(stmt)).scalar_one()
    
    last_msg, unread_count = await get_last_message_and_unread(db, conv.id, current_user.id)
    
    # Broadcast new system message so clients update
    from app.websocket.manager import manager
    payload = {
        "type": "new_message",
        "message": {
            "id": sys_msg.id,
            "conversation_id": sys_msg.conversation_id,
            "sender_id": sys_msg.sender_id,
            "content": sys_msg.content,
            "message_type": sys_msg.message_type,
            "status": "sent",
            "created_at": sys_msg.created_at.isoformat(),
            "updated_at": sys_msg.created_at.isoformat()
        }
    }
    await manager.broadcast_to_users([m.user_id for m in loaded.members], payload)
    
    conv_dict = {
        "id": loaded.id,
        "type": loaded.type,
        "name": loaded.name,
        "avatar_url": loaded.avatar_url,
        "created_by": loaded.created_by,
        "created_at": loaded.created_at,
        "updated_at": loaded.updated_at,
        "members": loaded.members,
        "unread_count": unread_count,
        "last_message": last_msg
    }
    return conv_dict

@router.delete("/{conv_id}/members/{user_id}")
async def remove_group_member(
    conv_id: str,
    user_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Determine if current user is admin or is removing themselves
    is_self = (current_user.id == user_id)
    
    member_stmt = select(ConversationMember).where(
        ConversationMember.conversation_id == conv_id,
        ConversationMember.user_id == current_user.id
    )
    current_member = (await db.execute(member_stmt)).scalar_one_or_none()
    
    if not current_member:
        raise HTTPException(status_code=403, detail="Not a member of this group")
        
    if not is_self and current_member.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
        
    target_stmt = select(ConversationMember).where(
        ConversationMember.conversation_id == conv_id,
        ConversationMember.user_id == user_id
    ).options(selectinload(ConversationMember.user))
    target_member = (await db.execute(target_stmt)).scalar_one_or_none()
    
    if not target_member:
        raise HTTPException(status_code=404, detail="User is not a member of this group")
        
    target_name = target_member.user.display_name
    
    await db.delete(target_member)
    
    # System message
    content = f"{current_user.display_name} left the group" if is_self else f"{current_user.display_name} removed {target_name} from the group"
    sys_msg = Message(
        conversation_id=conv_id,
        sender_id=current_user.id,
        content=content,
        message_type="system"
    )
    db.add(sys_msg)
    
    await db.commit()
    
    # Reload for broadcasting
    stmt = select(Conversation).where(Conversation.id == conv_id).options(
        selectinload(Conversation.members).selectinload(ConversationMember.user)
    ).execution_options(populate_existing=True)
    loaded = (await db.execute(stmt)).scalar_one_or_none()
    
    if loaded:
        from app.websocket.manager import manager
        payload = {
            "type": "new_message",
            "message": {
                "id": sys_msg.id,
                "conversation_id": sys_msg.conversation_id,
                "sender_id": sys_msg.sender_id,
                "content": sys_msg.content,
                "message_type": sys_msg.message_type,
                "status": "sent",
                "created_at": sys_msg.created_at.isoformat(),
                "updated_at": sys_msg.created_at.isoformat()
            }
        }
        await manager.broadcast_to_users([m.user_id for m in loaded.members] + [user_id], payload)
        
    return {"message": "Member removed successfully"}
