'use client';
import { useState } from 'react';
import Modal from '../ui/Modal';
import { useAuthStore } from '@/store/authStore';
import Avatar from '../ui/Avatar';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const user = useAuthStore(s => s.user);
  const [activeTab, setActiveTab] = useState<'profile' | 'privacy' | 'notifications'>('profile');

  if (!user) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Settings">
      <div className="flex flex-col md:flex-row min-h-[400px]">
        {/* Settings Sidebar */}
        <div className="w-full md:w-1/3 border-b md:border-b-0 md:border-r border-signal-border pr-0 md:pr-4 pb-4 md:pb-0 mb-4 md:mb-0 space-y-1">
          <button 
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'profile' ? 'bg-signal-sidebar-hover text-signal-text-primary' : 'text-signal-text-secondary hover:bg-signal-sidebar-hover/50 hover:text-signal-text-primary'
            }`}
          >
            Profile
          </button>

          <button 
            onClick={() => setActiveTab('privacy')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'privacy' ? 'bg-signal-sidebar-hover text-signal-text-primary' : 'text-signal-text-secondary hover:bg-signal-sidebar-hover/50 hover:text-signal-text-primary'
            }`}
          >
            Privacy
          </button>
          <button 
            onClick={() => setActiveTab('notifications')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'notifications' ? 'bg-signal-sidebar-hover text-signal-text-primary' : 'text-signal-text-secondary hover:bg-signal-sidebar-hover/50 hover:text-signal-text-primary'
            }`}
          >
            Notifications
          </button>
        </div>

        {/* Settings Content */}
        <div className="w-full md:w-2/3 md:pl-6 space-y-6">
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div className="flex flex-col items-center">
                <Avatar name={user.display_name} avatarUrl={user.avatar_url} size="lg" />
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-signal-text-secondary mb-1">Display Name</label>
                  <input type="text" defaultValue={user.display_name} className="w-full bg-signal-bg-secondary px-3 py-2 rounded-lg text-sm outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-signal-text-secondary mb-1">Username</label>
                  <input type="text" defaultValue={`@${user.username}`} disabled className="w-full bg-signal-bg-secondary/50 text-signal-text-tertiary px-3 py-2 rounded-lg text-sm outline-none cursor-not-allowed" />
                </div>
              </div>
            </div>
          )}



          {activeTab === 'privacy' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-signal-text-primary">Privacy</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-signal-bg-secondary rounded-lg">
                  <div>
                    <div className="text-sm font-medium">Read Receipts</div>
                    <div className="text-xs text-signal-text-secondary">If disabled, you won't see read receipts from others.</div>
                  </div>
                  <input type="checkbox" defaultChecked className="toggle toggle-primary" />
                </div>
                <div className="flex items-center justify-between p-3 bg-signal-bg-secondary rounded-lg">
                  <div>
                    <div className="text-sm font-medium">Typing Indicators</div>
                    <div className="text-xs text-signal-text-secondary">If disabled, you won't see typing indicators from others.</div>
                  </div>
                  <input type="checkbox" defaultChecked className="toggle toggle-primary" />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-signal-text-primary">Notifications</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-signal-bg-secondary rounded-lg">
                  <div>
                    <div className="text-sm font-medium">Message Sounds</div>
                  </div>
                  <input type="checkbox" defaultChecked className="toggle toggle-primary" />
                </div>
                <div className="flex items-center justify-between p-3 bg-signal-bg-secondary rounded-lg">
                  <div>
                    <div className="text-sm font-medium">Desktop Notifications</div>
                  </div>
                  <input type="checkbox" defaultChecked className="toggle toggle-primary" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
