'use client';
import { useAuthStore } from '@/store/authStore';

export default function SidebarHeader({ onNewChat, onNewGroup }: { onNewChat?: () => void, onNewGroup?: () => void }) {
  const user = useAuthStore((s) => s.user);

  return (
    <>
      <div className="h-14 px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="font-semibold text-xl text-signal-text-primary">
            Chats
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={onNewGroup}
            className="text-signal-text-secondary hover:text-signal-text-primary transition-colors"
            title="New Group"
          >
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
          </button>
          <button 
            onClick={onNewChat}
            className="text-signal-text-secondary hover:text-signal-text-primary transition-colors"
            title="New Chat"
          >
            <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
              <path d="M19.005 3.175H4.674C3.642 3.175 3 3.789 3 4.821V21.02l3.544-3.514h12.461c1.033 0 1.664-.614 1.664-1.646V4.821c-.001-1.032-.632-1.646-1.664-1.646zm-6.645 10.74h-1.39V10.28H7.337v-1.39h3.633V5.257h1.39v3.633h3.633v1.39h-3.633v3.635z"/>
            </svg>
          </button>
        </div>
      </div>
    </>
  );
}
