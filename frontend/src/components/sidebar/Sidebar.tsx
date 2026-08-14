'use client';
import { useState } from 'react';
import SidebarHeader from './SidebarHeader';
import SearchBar from './SearchBar';
import ConversationList from './ConversationList';
import AddContactModal from '../contacts/AddContactModal';
import CreateGroupModal from '../groups/CreateGroupModal';

export default function Sidebar() {
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const [isNewGroupOpen, setIsNewGroupOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="w-[320px] lg:w-[380px] h-full flex flex-col bg-signal-sidebar border-r border-signal-border shrink-0">
      <SidebarHeader onNewChat={() => setIsNewChatOpen(true)} onNewGroup={() => setIsNewGroupOpen(true)} />
      <div className="px-3 py-2">
        <SearchBar query={searchQuery} setQuery={setSearchQuery} />
      </div>
      <ConversationList searchQuery={searchQuery} />
      <AddContactModal isOpen={isNewChatOpen} onClose={() => setIsNewChatOpen(false)} />
      <CreateGroupModal isOpen={isNewGroupOpen} onClose={() => setIsNewGroupOpen(false)} />
    </div>
  );
}
