'use client';
import { useEffect } from 'react';
import { useChatStore } from '@/store/chatStore';
import ConversationItem from './ConversationItem';

export default function ConversationList({ searchQuery }: { searchQuery: string }) {
  const { conversations, fetchConversations, isLoading } = useChatStore();

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  if (isLoading && conversations.length === 0) {
    return (
      <div className="flex-1 flex justify-center mt-8">
        <div className="w-6 h-6 border-2 border-signal-border border-t-signal-blue rounded-full animate-spin"></div>
      </div>
    );
  }

  const filtered = conversations.filter(conv => {
    if (!searchQuery) return true;
    const name = conv.name?.toLowerCase() || '';
    const memberNames = conv.type === 'dm' ? conv.members.map(m => m.user.display_name.toLowerCase()).join(' ') : '';
    return name.includes(searchQuery.toLowerCase()) || memberNames.includes(searchQuery.toLowerCase());
  });

  return (
    <div className="flex-1 overflow-y-auto">
      {filtered.length === 0 ? (
        <div className="text-center text-signal-text-tertiary text-sm mt-8">
          No conversations found
        </div>
      ) : (
        filtered.map(conv => (
          <ConversationItem key={conv.id} conversation={conv} />
        ))
      )}
    </div>
  );
}
