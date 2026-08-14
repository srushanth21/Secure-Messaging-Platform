'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import Avatar from '@/components/ui/Avatar';
import Spinner from '@/components/ui/Spinner';

export default function ProfileSetupPage() {
  const { user, updateProfile } = useAuthStore();
  const addToast = useUIStore((s) => s.addToast);
  const router = useRouter();
  
  const [displayName, setDisplayName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setDisplayName(user.username || '');
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await updateProfile({ display_name: displayName });
      router.push('/chat');
    } catch (err: any) {
      addToast(err.response?.data?.detail || 'Failed to update profile', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-lg border border-signal-border text-center">
      <h2 className="text-2xl font-semibold text-signal-text-primary mb-6">Profile Setup</h2>
      
      <div className="flex justify-center mb-8">
        <Avatar name={displayName || 'User'} size="xl" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <input
            type="text"
            placeholder="Display Name"
            required
            className="w-full h-11 px-4 text-signal-text-primary border border-signal-border rounded-lg focus:border-signal-blue focus:ring-1 focus:ring-signal-blue outline-none transition-colors text-center"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full h-11 bg-signal-blue text-white font-medium rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center disabled:opacity-70"
        >
          {isLoading ? <Spinner size="sm" /> : 'Get Started'}
        </button>
      </form>
    </div>
  );
}
