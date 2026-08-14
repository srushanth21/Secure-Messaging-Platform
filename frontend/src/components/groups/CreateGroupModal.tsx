'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Modal from '../ui/Modal';
import { useChatStore } from '@/store/chatStore';
import { Contact, User } from '@/types';
import Avatar from '../ui/Avatar';
import Spinner from '../ui/Spinner';

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateGroupModal({ isOpen, onClose }: CreateGroupModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [groupName, setGroupName] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  
  const { contacts, fetchContacts, createGroup } = useChatStore();

  useEffect(() => {
    if (isOpen) {
      fetchContacts();
      setStep(1);
      setGroupName('');
      setSelectedIds(new Set());
    }
  }, [isOpen, fetchContacts]);

  const toggleUser = (userId: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(userId)) newSet.delete(userId);
    else newSet.add(userId);
    setSelectedIds(newSet);
  };

  const handleNext = () => {
    if (selectedIds.size > 0) setStep(2);
  };

  const handleCreate = async () => {
    if (!groupName.trim() || selectedIds.size === 0) return;
    setIsSubmitting(true);
    try {
      const newGroup = await createGroup(groupName.trim(), Array.from(selectedIds));
      onClose();
      router.push(`/chat/${newGroup.id}`);
    } catch (e) {
      console.error(e);
    }
    setIsSubmitting(false);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={step === 1 ? "Add Members" : "Name Group"}>
      {step === 1 ? (
        <div className="space-y-4">
          <div className="text-sm text-signal-text-secondary mb-2">Select at least one contact</div>
          
          <div className="min-h-[200px] max-h-[400px] overflow-y-auto space-y-1">
            {contacts.length === 0 ? (
              <div className="text-center text-signal-text-tertiary py-8">No contacts found</div>
            ) : (
              contacts.map(contact => (
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
              onClick={handleNext}
              disabled={selectedIds.size === 0}
              className="px-6 py-2 bg-signal-blue hover:bg-signal-blue-hover disabled:opacity-50 text-white rounded-full font-medium transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full bg-signal-bg-secondary flex items-center justify-center text-signal-text-tertiary border border-dashed border-signal-border">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
              </svg>
            </div>
          </div>
          
          <input
            type="text"
            placeholder="Group name (required)"
            className="w-full h-11 px-4 rounded-lg bg-signal-bg-secondary border-none focus:ring-2 focus:ring-signal-blue outline-none"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            autoFocus
          />
          
          <div className="pt-4 flex justify-between">
            <button
              onClick={() => setStep(1)}
              className="px-4 py-2 text-signal-blue font-medium"
            >
              Back
            </button>
            <button
              onClick={handleCreate}
              disabled={!groupName.trim() || isSubmitting}
              className="px-6 py-2 bg-signal-blue hover:bg-signal-blue-hover disabled:opacity-50 text-white rounded-full font-medium transition-colors flex items-center gap-2"
            >
              {isSubmitting && <Spinner size="sm" />}
              Create
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
