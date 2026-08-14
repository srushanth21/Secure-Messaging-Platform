'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import ToastContainer from '@/components/ui/Toast';
import Spinner from '@/components/ui/Spinner';
import Sidebar from '@/components/sidebar/Sidebar';
import NavigationRail from '@/components/sidebar/NavigationRail';
import SettingsPanel from '@/components/settings/SettingsPanel';
import { useUIStore } from '@/store/uiStore';
import { useWebSocketInit } from '@/hooks/useWebSocket';

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  const { hydrateFromStorage, isAuthenticated, isLoading } = useAuthStore();
  const { setTheme } = useUIStore();
  const router = useRouter();

  // Initialize WebSocket connection for real-time messaging
  useWebSocketInit();

  useEffect(() => {
    hydrateFromStorage();
    
    // Load theme
    const savedTheme = localStorage.getItem('signal_theme') as any;
    if (savedTheme) {
      setTheme(savedTheme);
    } else {
      setTheme('system');
    }
  }, [hydrateFromStorage, setTheme]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/auth');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-signal-bg">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-white font-sans">
      <NavigationRail />
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 bg-signal-bg">
        {children}
      </div>
      <SettingsPanel />
      <ToastContainer />
    </div>
  );
}
