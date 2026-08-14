import { create } from 'zustand';
import type { User, AuthResponse } from '@/types';
import api from '@/lib/api';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  register: (username: string, password: string, phone?: string) => Promise<User>;
  verifyOTP: (username: string, otp: string) => Promise<AuthResponse>;
  login: (username: string, password: string) => Promise<AuthResponse>;
  updateProfile: (data: { display_name?: string; status_text?: string }) => Promise<User>;
  fetchMe: () => Promise<void>;
  logout: () => Promise<void>;
  setAuth: (token: string, user: User) => void;
  hydrateFromStorage: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,

  register: async (username, password, phone) => {
    const res = await api.post('/auth/register', { username, password, phone });
    return res.data;
  },

  verifyOTP: async (username, otp) => {
    const res = await api.post('/auth/verify-otp', { username, otp });
    const { access_token, user } = res.data;
    get().setAuth(access_token, user);
    return res.data;
  },

  login: async (username, password) => {
    const res = await api.post('/auth/login', { username, password });
    const { access_token, user } = res.data;
    get().setAuth(access_token, user);
    return res.data;
  },

  updateProfile: async (data) => {
    const res = await api.put('/auth/profile', data);
    set({ user: res.data });
    localStorage.setItem('signal_user', JSON.stringify(res.data));
    return res.data;
  },

  fetchMe: async () => {
    try {
      const res = await api.get('/auth/me');
      set({ user: res.data, isAuthenticated: true, isLoading: false });
      localStorage.setItem('signal_user', JSON.stringify(res.data));
    } catch {
      set({ user: null, token: null, isAuthenticated: false, isLoading: false });
      localStorage.removeItem('signal_token');
      localStorage.removeItem('signal_user');
    }
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch { /* ignore */ }
    set({ user: null, token: null, isAuthenticated: false });
    localStorage.removeItem('signal_token');
    localStorage.removeItem('signal_user');
  },

  setAuth: (token, user) => {
    localStorage.setItem('signal_token', token);
    localStorage.setItem('signal_user', JSON.stringify(user));
    set({ token, user, isAuthenticated: true, isLoading: false });
  },

  hydrateFromStorage: () => {
    const token = localStorage.getItem('signal_token');
    const userStr = localStorage.getItem('signal_user');
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        set({ token, user, isAuthenticated: true, isLoading: false });
      } catch {
        set({ isLoading: false });
      }
    } else {
      set({ isLoading: false });
    }
  },
}));
