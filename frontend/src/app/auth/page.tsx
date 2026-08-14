'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import Spinner from '@/components/ui/Spinner';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login, register } = useAuthStore();
  const addToast = useUIStore((s) => s.addToast);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (isLogin) {
        await login(username, password);
        router.push('/chat');
      } else {
        await register(username, password, phone);
        router.push(`/auth/verify?username=${encodeURIComponent(username)}`);
      }
    } catch (err: any) {
      addToast(err.response?.data?.detail || 'Authentication failed', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-lg border border-signal-border">
      <div className="flex flex-col items-center mb-8">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="w-16 h-16 text-signal-blue mb-4"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 2C12 2 4.5 4.5 4.5 9.5C4.5 15.5 12 22 12 22C12 22 19.5 15.5 19.5 9.5C19.5 4.5 12 2 12 2Z"
            fill="currentColor"
          />
        </svg>
        <h1 className="text-3xl font-semibold text-signal-text-primary mb-2">Signal</h1>
        <p className="text-signal-text-secondary text-sm">Privacy-focused messaging</p>
      </div>

      <div className="flex mb-6 bg-gray-100 p-1 rounded-xl">
        <button
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
            isLogin ? 'bg-white shadow-sm text-signal-text-primary' : 'text-signal-text-secondary hover:text-signal-text-primary'
          }`}
          onClick={() => setIsLogin(true)}
        >
          Login
        </button>
        <button
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
            !isLogin ? 'bg-white shadow-sm text-signal-text-primary' : 'text-signal-text-secondary hover:text-signal-text-primary'
          }`}
          onClick={() => setIsLogin(false)}
        >
          Register
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="text"
            placeholder="Username"
            required
            className="w-full h-11 px-4 text-signal-text-primary border border-signal-border rounded-lg focus:border-signal-blue focus:ring-1 focus:ring-signal-blue outline-none transition-colors"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        
        {!isLogin && (
          <div>
            <input
              type="tel"
              placeholder="Phone number (optional)"
              className="w-full h-11 px-4 text-signal-text-primary border border-signal-border rounded-lg focus:border-signal-blue focus:ring-1 focus:ring-signal-blue outline-none transition-colors"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
        )}

        <div>
          <input
            type="password"
            placeholder="Password"
            required
            className="w-full h-11 px-4 text-signal-text-primary border border-signal-border rounded-lg focus:border-signal-blue focus:ring-1 focus:ring-signal-blue outline-none transition-colors"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full h-11 bg-signal-blue text-white font-medium rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center disabled:opacity-70 mt-2"
        >
          {isLoading ? <Spinner size="sm" /> : (isLogin ? 'Log In' : 'Register')}
        </button>
      </form>
    </div>
  );
}
