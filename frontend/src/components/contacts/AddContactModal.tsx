'use client';
import { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import { useChatStore } from '@/store/chatStore';
import { User } from '@/types';
import Avatar from '../ui/Avatar';
import Spinner from '../ui/Spinner';

interface AddContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddContactModal({ isOpen, onClose }: AddContactModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const { searchUsers, createDM, addContact } = useChatStore();

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.length >= 2) {
        setIsSearching(true);
        const users = await searchUsers(query);
        setResults(users);
        setIsSearching(false);
      } else {
        setResults([]);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query, searchUsers]);

  const handleStartChat = async (userId: string, username: string) => {
    // Add to contacts first so they appear in Create Group
    await addContact(username);
    await createDM(userId);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="New Chat">
      <div className="space-y-4">
        <input
          type="text"
          placeholder="Search by username or name..."
          className="w-full h-11 px-4 rounded-lg bg-signal-bg-secondary border-none focus:ring-2 focus:ring-signal-blue outline-none transition-shadow"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />

        <div className="min-h-[200px] max-h-[400px] overflow-y-auto">
          {isSearching ? (
            <div className="flex justify-center py-8"><Spinner size="md" /></div>
          ) : results.length > 0 ? (
            <div className="space-y-1">
              {results.map(user => (
                <div
                  key={user.id}
                  onClick={() => handleStartChat(user.id, user.username)}
                  className="flex items-center gap-3 p-3 hover:bg-signal-sidebar-hover rounded-lg cursor-pointer"
                >
                  <Avatar name={user.display_name} avatarUrl={user.avatar_url} />
                  <div className="flex-1">
                    <div className="font-medium text-signal-text-primary">{user.display_name}</div>
                    <div className="text-sm text-signal-text-secondary">@{user.username}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : query.length >= 2 ? (
            <div className="text-center text-signal-text-tertiary py-8">No users found</div>
          ) : (
            <div className="text-center text-signal-text-tertiary py-8">Type to search for people</div>
          )}
        </div>
      </div>
    </Modal>
  );
}
