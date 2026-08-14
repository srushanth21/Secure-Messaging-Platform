import { create } from 'zustand';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface UIState {
  isSidebarOpen: boolean;
  activePanel: 'none' | 'settings' | 'group-info' | 'contact-info';
  toasts: Toast[];
  theme: 'light' | 'dark' | 'system';
  isSettingsOpen: boolean;
  
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setActivePanel: (panel: UIState['activePanel']) => void;
  addToast: (message: string, type?: Toast['type']) => void;
  removeToast: (id: string) => void;
  setTheme: (theme: UIState['theme']) => void;
  setSettingsOpen: (isOpen: boolean) => void;
}

export const useUIStore = create<UIState>((set, get) => ({
  isSidebarOpen: true,
  activePanel: 'none',
  toasts: [],
  theme: 'light',
  isSettingsOpen: false,

  toggleSidebar: () => set((s) => ({ isSidebarOpen: !s.isSidebarOpen })),
  setSidebarOpen: (open) => set({ isSidebarOpen: open }),
  setActivePanel: (panel) => set({ activePanel: panel }),
  
  addToast: (message, type = 'info') => {
    const id = Math.random().toString(36).slice(2);
    set((s) => ({ toasts: [...s.toasts, { id, message, type }] }));
    setTimeout(() => get().removeToast(id), 4000);
  },
  
  removeToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
  
  setTheme: (theme) => {
    set({ theme });
    if (typeof document !== 'undefined') {
      const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      localStorage.setItem('signal_theme', theme);
    }
  },
  
  setSettingsOpen: (isOpen) => set({ isSettingsOpen: isOpen }),
}));
