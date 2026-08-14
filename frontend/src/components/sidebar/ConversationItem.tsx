'use client';
import { useRouter } from 'next/navigation';
import { Conversation } from '@/types';
import Avatar from '../ui/Avatar';
import { formatRelativeTime } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';
import { useChatStore } from '@/store/chatStore';

export default function ConversationItem({ conversation }: { conversation: Conversation }) {
  const currentUser = useAuthStore((s) => s.user);
  const { activeConversationId, setActiveConversation } = useChatStore();
  const router = useRouter();
  
  const isActive = activeConversationId === conversation.id;
  
  // Determine name and avatar based on conversation type
  let name = conversation.name;
  let avatarUrl = conversation.avatar_url;
  let isOnline = false;
  
  if (conversation.type === 'dm' && currentUser) {
    const otherMember = conversation.members.find(m => m.user_id !== currentUser.id);
    if (otherMember) {
      name = otherMember.user.display_name;
      avatarUrl = otherMember.user.avatar_url;
      isOnline = otherMember.user.is_online;
    }
  }

  const timeStr = conversation.last_message ? formatRelativeTime(conversation.last_message.created_at) : '';

  return (
    <div 
      onClick={() => {
        setActiveConversation(conversation.id);
        router.push(`/chat/${conversation.id}`);
      }}
      className={`h-[72px] px-3 flex items-center gap-3 cursor-pointer transition-colors
        ${isActive ? 'bg-signal-sidebar-active' : 'hover:bg-signal-sidebar-hover'}
      `}
    >
      <Avatar name={name || 'Unknown'} avatarUrl={avatarUrl} isOnline={isOnline} />
      
      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <div className="flex justify-between items-baseline">
          <span className="text-[15px] font-semibold text-signal-text-primary truncate">
            {name}
          </span>
          <span className="text-[12px] text-signal-text-tertiary ml-2 shrink-0">
            {timeStr}
          </span>
        </div>
        
        <div className="flex justify-between items-center mt-0.5">
          <span className={`text-[14px] truncate ${conversation.unread_count > 0 ? 'text-signal-text-primary font-medium' : 'text-signal-text-secondary'}`}>
            {conversation.last_message?.content || 'No messages yet'}
          </span>
          
          {conversation.unread_count > 0 && (
            <div className="bg-signal-blue text-white text-[11px] font-bold min-w-[20px] h-[20px] rounded-full flex items-center justify-center px-1 ml-2 shrink-0">
              {conversation.unread_count}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
