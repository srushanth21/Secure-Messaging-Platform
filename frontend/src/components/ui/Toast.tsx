'use client';
import { useUIStore } from '@/store/uiStore';
import { useEffect, useState } from 'react';

function ToastItem({ id, message, type }: { id: string; message: string; type: string }) {
  const removeToast = useUIStore((s) => s.removeToast);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsExiting(true), 3500);
    return () => clearTimeout(timer);
  }, []);

  const bgColor = type === 'error' ? 'bg-signal-red' : type === 'success' ? 'bg-signal-green' : 'bg-signal-blue';

  return (
    <div
      className={`${bgColor} text-white px-4 py-3 rounded-lg shadow-lg text-sm font-medium
        flex items-center gap-2 transition-all duration-300 cursor-pointer
        ${isExiting ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'}`}
      onClick={() => removeToast(id)}
      onTransitionEnd={() => isExiting && removeToast(id)}
    >
      {message}
    </div>
  );
}

export default function ToastContainer() {
  const toasts = useUIStore((s) => s.toasts);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 items-center">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} {...toast} />
      ))}
    </div>
  );
}
