'use client';
import { useToastStore } from '@/store/toastStore';

export default function ToastContainer() {
  const toasts = useToastStore(s => s.toasts);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 items-center pointer-events-none">
      {toasts.map(toast => {
        let bgColor = 'bg-gray-800';
        if (toast.type === 'success') bgColor = 'bg-green-600';
        if (toast.type === 'error') bgColor = 'bg-red-600';
        
        return (
          <div 
            key={toast.id}
            className={`${bgColor} text-white px-4 py-2 rounded-full shadow-lg text-sm font-medium pointer-events-auto flex items-center gap-2 animate-fade-in-up`}
          >
            {toast.type === 'success' && (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            )}
            {toast.type === 'error' && (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="15" y1="9" x2="9" y2="15"></line>
                <line x1="9" y1="9" x2="15" y2="15"></line>
              </svg>
            )}
            {toast.message}
          </div>
        );
      })}
    </div>
  );
}
