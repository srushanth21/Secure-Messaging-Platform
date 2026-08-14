'use client';
import { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import { useChatStore } from '@/store/chatStore';
import { useToastStore } from '@/store/toastStore';
import { Conversation } from '@/types';
import Avatar from '../ui/Avatar';
import Spinner from '../ui/Spinner';

interface AddGroupMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  conversation: Conversation;
}

export default function AddGroupMembersModal({ isOpen, onClose, conversation }: AddGroupMembersModalProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { contacts, fetchContacts, addGroupMembers } = useChatStore();

  useEffect(() => {
    if (isOpen) {
      fetchContacts();
      setSelectedIds(new Set());
    }
  }, [isOpen, fetchContacts]);

  // Filter out contacts that are already in the group
  const existingMemberIds = new Set(conversation.members.map(m => m.user_id));
  const availableContacts = contacts.filter(c => !existingMemberIds.has(c.contact_user.id));

  const toggleUser = (userId: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(userId)) newSet.delete(userId);
    else newSet.add(userId);
    setSelectedIds(newSet);
  };

  const handleAdd = async () => {
    if (selectedIds.size === 0) return;
    setIsSubmitting(true);
    try {
      await addGroupMembers(conversation.id, Array.from(selectedIds));
      useToastStore.getState().addToast(`Added ${selectedIds.size} member${selectedIds.size > 1 ? 's' : ''}`, 'success');
      onClose();
    } catch (e) {
      console.error(e);
      useToastStore.getState().addToast('Failed to add members', 'error');
    }
    setIsSubmitting(false);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Members">
      <div className="space-y-4">
        <div className="text-sm text-signal-text-secondary mb-2">Select contacts to add to this group</div>
        
        <div className="min-h-[200px] max-h-[400px] overflow-y-auto space-y-1">
          {availableContacts.length === 0 ? (
            <div className="text-center text-signal-text-tertiary py-8">No more contacts to add</div>
          ) : (
            availableContacts.map(contact => (
              <div
                key={contact.contact_user.id}
                onClick={() => toggleUser(contact.contact_user.id)}
                className="flex items-center gap-3 p-3 hover:bg-signal-sidebar-hover rounded-lg cursor-pointer transition-colors"
              >
                <div className="w-5 h-5 rounded-full border border-signal-border flex items-center justify-center">
                  {selectedIds.has(contact.contact_user.id) && (
                    <div className="w-3 h-3 bg-signal-blue rounded-full" />
                  )}
                </div>
                <Avatar name={contact.contact_user.display_name} avatarUrl={contact.contact_user.avatar_url} />
                <div className="font-medium text-signal-text-primary">{contact.contact_user.display_name}</div>
              </div>
            ))
          )}
        </div>
        
        <div className="pt-4 flex justify-end">
          <button
            onClick={handleAdd}
            disabled={selectedIds.size === 0 || isSubmitting}
            className="px-6 py-2 bg-signal-blue hover:bg-signal-blue-hover disabled:opacity-50 text-white rounded-full font-medium transition-colors flex items-center gap-2"
          >
            {isSubmitting && <Spinner size="sm" />}
            Add
          </button>
        </div>
      </div>
    </Modal>
  );
}
