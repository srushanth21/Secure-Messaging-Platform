'use client';
import { useState } from 'react';
import Modal from '../ui/Modal';
import Avatar from '../ui/Avatar';
import { Conversation, User } from '@/types';
import { useChatStore } from '@/store/chatStore';
import { useToastStore } from '@/store/toastStore';
import Spinner from '../ui/Spinner';
import AddGroupMembersModal from './AddGroupMembersModal';

interface GroupDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  conversation: Conversation;
  currentUser: User;
}

export default function GroupDetailsModal({ isOpen, onClose, conversation, currentUser }: GroupDetailsModalProps) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const { removeGroupMember } = useChatStore();

  if (conversation.type !== 'group') return null;

  const currentMember = conversation.members.find(m => m.user_id === currentUser.id);
  const isAdmin = currentMember?.role === 'admin' || conversation.created_by === currentUser.id;

  const handleRemove = async (userId: string) => {
    setRemovingId(userId);
    try {
      await removeGroupMember(conversation.id, userId);
      useToastStore.getState().addToast(userId === currentUser.id ? 'You left the group' : 'Member removed', 'success');
    } catch (e) {
      console.error(e);
      useToastStore.getState().addToast('Failed to remove member', 'error');
    }
    setRemovingId(null);
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="Group Details">
        <div className="space-y-6">
          <div className="flex flex-col items-center">
            <Avatar name={conversation.name || 'Group'} avatarUrl={conversation.avatar_url} size="lg" />
            <h2 className="mt-4 text-xl font-bold text-signal-text-primary">{conversation.name}</h2>
            <p className="text-sm text-signal-text-secondary mt-1">{conversation.members.length} members</p>
          </div>

          <div className="border-t border-signal-border pt-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-semibold text-signal-text-secondary uppercase tracking-wider">Members</h3>
              {isAdmin && (
                <button 
                  onClick={() => setIsAddModalOpen(true)}
                  className="text-sm text-signal-blue hover:text-signal-blue-hover font-medium flex items-center gap-1"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                  Add Members
                </button>
              )}
            </div>

            <div className="max-h-[300px] overflow-y-auto space-y-1 pr-1">
              {conversation.members.map(member => {
                const isMe = member.user_id === currentUser.id;
                
                return (
                  <div key={member.id} className="flex items-center justify-between p-2 hover:bg-signal-sidebar-hover rounded-lg transition-colors">
                    <div className="flex items-center gap-3">
                      <Avatar name={member.user.display_name} avatarUrl={member.user.avatar_url} isOnline={member.user.is_online} size="sm" />
                      <div className="flex flex-col">
                        <span className="text-[15px] font-medium text-signal-text-primary flex items-center gap-2">
                          {isMe ? 'You' : member.user.display_name}
                          {member.role === 'admin' && (
                            <span className="text-[10px] bg-signal-blue/10 text-signal-blue px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">Admin</span>
                          )}
                        </span>
                        {!isMe && <span className="text-[13px] text-signal-text-tertiary">@{member.user.username}</span>}
                      </div>
                    </div>
                    
                    {removingId === member.user_id ? (
                      <Spinner size="sm" />
                    ) : (
                      (isAdmin && !isMe) ? (
                        <button 
                          onClick={() => handleRemove(member.user_id)}
                          className="text-signal-red hover:bg-signal-red/10 px-2 py-1 rounded text-sm transition-colors"
                        >
                          Remove
                        </button>
                      ) : (isMe) ? (
                        <button 
                          onClick={() => handleRemove(member.user_id)}
                          className="text-signal-red hover:bg-signal-red/10 px-2 py-1 rounded text-sm transition-colors"
                        >
                          Leave
                        </button>
                      ) : null
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </Modal>

      <AddGroupMembersModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        conversation={conversation}
      />
    </>
  );
}
