import { MessageStatus } from '@/types';

export default function MessageStatusIcon({ status }: { status: MessageStatus }) {
  if (status === 'sending') {
    return (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <polyline points="12 6 12 12 16 14"></polyline>
      </svg>
    );
  }
  
  if (status === 'sent') {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
    );
  }

  // Double check (delivered or read)
  const isRead = status === 'read';
  return (
    <div className={`relative w-[18px] h-[14px] ${isRead ? 'text-white' : 'opacity-70'}`}>
      <svg className="absolute left-0 top-0" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={isRead ? "3" : "2.5"} strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
      <svg className="absolute left-[4px] top-0" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={isRead ? "3" : "2.5"} strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
    </div>
  );
}
