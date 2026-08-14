'use client';
import { useEffect } from 'react';
import Modal from '../ui/Modal';
import { useUIStore } from '@/store/uiStore';
import { useAuthStore } from '@/store/authStore';
import Avatar from '../ui/Avatar';

export default function SettingsPanel() {
  const { isSettingsOpen, setSettingsOpen, theme, setTheme } = useUIStore();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    setSettingsOpen(false);
  };

  return (
    <Modal isOpen={isSettingsOpen} onClose={() => setSettingsOpen(false)} title="Settings">
      <div className="space-y-6">
        {/* Profile Section */}
        {user && (
          <div className="flex items-center gap-4 p-4 bg-signal-bg-secondary rounded-xl">
            <Avatar name={user.display_name} avatarUrl={user.avatar_url} size="lg" />
            <div>
              <h3 className="font-semibold text-lg text-signal-text-primary">{user.display_name}</h3>
              <p className="text-signal-text-secondary">@{user.username}</p>
            </div>
          </div>
        )}

        {/* Appearance Section */}
        <div>
          <h4 className="font-semibold text-signal-text-primary mb-3">Appearance</h4>
          <div className="space-y-2">
            {(['light', 'dark', 'system'] as const).map((t) => (
              <label key={t} className="flex items-center gap-3 p-3 hover:bg-signal-sidebar-hover rounded-lg cursor-pointer transition-colors">
                <input 
                  type="radio" 
                  name="theme" 
                  value={t}
                  checked={theme === t}
                  onChange={() => setTheme(t)}
                  className="w-4 h-4 text-signal-blue accent-signal-blue"
                />
                <span className="capitalize text-signal-text-primary">{t} Theme</span>
              </label>
            ))}
          </div>
        </div>

        {/* Danger Zone */}
        <div className="pt-4 border-t border-signal-border">
          <button 
            onClick={handleLogout}
            className="w-full text-left p-3 text-red-500 hover:bg-red-50 rounded-lg font-medium transition-colors"
          >
            Log Out
          </button>
        </div>
      </div>
    </Modal>
  );
}
