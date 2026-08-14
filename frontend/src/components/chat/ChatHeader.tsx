import { useState } from 'react';
import Avatar from '../ui/Avatar';
import { Conversation, User } from '@/types';
import GroupDetailsModal from '../groups/GroupDetailsModal';

interface ChatHeaderProps {
  conversation: Conversation;
  currentUser: User;
  typingUsers?: string[];
}

export default function ChatHeader({ conversation, currentUser, typingUsers = [] }: ChatHeaderProps) {
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  
  let name = conversation.name;
  let avatarUrl = conversation.avatar_url;
  let isOnline = false;
  let statusText = '';
  
  // Filter out the current user just in case
  const othersTyping = typingUsers.filter(id => id !== currentUser.id);

  if (conversation.type === 'dm') {
    const otherMember = conversation.members.find(m => m.user_id !== currentUser.id);
    if (otherMember) {
      name = otherMember.user.display_name;
      avatarUrl = otherMember.user.avatar_url;
      isOnline = otherMember.user.is_online;
      
      if (othersTyping.length > 0) {
        statusText = 'typing...';
      } else {
        statusText = isOnline ? 'Online' : 'Offline';
      }
    }
  } else {
    if (othersTyping.length > 0) {
      const typingMembers = conversation.members
        .filter(m => othersTyping.includes(m.user_id))
        .map(m => m.user.display_name);
      statusText = `${typingMembers.join(', ')} typing...`;
    } else {
      statusText = `${conversation.members.length} members`;
    }
  }

  const handleHeaderClick = () => {
    if (conversation.type === 'group') {
      setIsGroupModalOpen(true);
    }
  };

  return (
    <>
      <div className="h-16 px-4 flex items-center justify-between bg-signal-bg border-b border-signal-border z-10 shrink-0 shadow-sm">
        <div className="flex items-center gap-3 cursor-pointer" onClick={handleHeaderClick}>
          <Avatar name={name || 'Unknown'} avatarUrl={avatarUrl} size="sm" isOnline={isOnline} />
          <div>
            <h2 className="text-[15px] font-semibold text-signal-text-primary leading-tight hover:underline">{name}</h2>
            <p className={`text-[12px] ${othersTyping.length > 0 ? 'text-signal-blue font-medium' : 'text-signal-text-secondary'}`}>{statusText}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 text-signal-text-secondary">
          <button className="hover:text-signal-text-primary transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="23 7 16 12 23 17 23 7"></polygon>
              <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
            </svg>
          </button>
          <button className="hover:text-signal-text-primary transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
            </svg>
          </button>
          <button className="hover:text-signal-text-primary transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="1"></circle>
              <circle cx="12" cy="5" r="1"></circle>
              <circle cx="12" cy="19" r="1"></circle>
            </svg>
          </button>
        </div>
      </div>
      
      {conversation.type === 'group' && (
        <GroupDetailsModal 
          isOpen={isGroupModalOpen} 
          onClose={() => setIsGroupModalOpen(false)} 
          conversation={conversation}
          currentUser={currentUser}
        />
      )}
    </>
  );
}
