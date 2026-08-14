'use client';
import { useState } from 'react';
import Avatar from '../ui/Avatar';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { useChatStore } from '@/store/chatStore';

export default function NavigationRail() {
  const user = useAuthStore((s) => s.user);
  const { setSettingsOpen, theme } = useUIStore();
  const [activeTab, setActiveTab] = useState<'chats' | 'calls' | 'stories'>('chats');
  
  const handleTabClick = (tab: 'chats' | 'calls' | 'stories') => {
    setActiveTab(tab);
    if (tab === 'calls' || tab === 'stories') {
      useUIStore.getState().addToast(`${tab === 'calls' ? 'Calls' : 'Stories'} feature is still working...`, 'info');
      // Reset back to chats after a brief moment since they are placeholders
      setTimeout(() => setActiveTab('chats'), 2000);
    }
  };

  return (
    <div className="w-16 h-full flex flex-col items-center py-4 bg-signal-bg-secondary border-r border-signal-border shrink-0 z-10">
      <div 
        className="mb-8" 
        title="Profile"
      >
        {user ? (
          <Avatar name={user.display_name} avatarUrl={user.avatar_url} size="sm" />
        ) : (
          <div className="w-10 h-10 rounded-full bg-signal-bg" />
        )}
      </div>
      
      <div className="flex-1 flex flex-col gap-6 w-full items-center">
        <button 
          onClick={() => handleTabClick('chats')}
          className={`relative p-2 rounded-xl transition-colors ${activeTab === 'chats' ? 'text-signal-blue bg-signal-blue-light/50' : 'text-signal-text-tertiary hover:text-signal-text-primary hover:bg-black/5'}`}
          title="Chats"
        >
          <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
            <path d="M19.005 3.175H4.674C3.642 3.175 3 3.789 3 4.821V21.02l3.544-3.514h12.461c1.033 0 1.664-.614 1.664-1.646V4.821c-.001-1.032-.632-1.646-1.664-1.646zm-6.645 10.74h-1.39V10.28H7.337v-1.39h3.633V5.257h1.39v3.633h3.633v1.39h-3.633v3.635z"/>
          </svg>
        </button>
        
        <button 
          onClick={() => handleTabClick('calls')}
          className={`relative p-2 rounded-xl transition-colors ${activeTab === 'calls' ? 'text-signal-blue bg-signal-blue-light/50' : 'text-signal-text-tertiary hover:text-signal-text-primary hover:bg-black/5'}`}
          title="Calls"
        >
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
          </svg>
        </button>
        
        <button 
          onClick={() => handleTabClick('stories')}
          className={`relative p-2 rounded-xl transition-colors ${activeTab === 'stories' ? 'text-signal-blue bg-signal-blue-light/50' : 'text-signal-text-tertiary hover:text-signal-text-primary hover:bg-black/5'}`}
          title="Status"
        >
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <circle cx="12" cy="12" r="6" strokeDasharray="4 4"></circle>
          </svg>
        </button>
      </div>

      <div className="mt-auto">
        <button 
          onClick={() => setSettingsOpen(true)}
          className="relative p-2 rounded-xl transition-colors text-signal-text-tertiary hover:text-signal-text-primary hover:bg-black/5"
          title="Settings"
        >
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3"></circle>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
          </svg>
        </button>
      </div>
    </div>
  );
}
