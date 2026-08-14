'use client';
import { Message, User } from '@/types';
import { formatMessageTime } from '@/lib/utils';
import MessageStatusIcon from './MessageStatusIcon';

interface MessageBubbleProps {
  message: Message;
  isSentByMe: boolean;
  isFirst?: boolean;
  isMiddle?: boolean;
  isLast?: boolean;
  isSingle?: boolean;
  sender?: User;
}

export default function MessageBubble({ 
  message, 
  isSentByMe, 
  isFirst = true,
  isMiddle = false,
  isLast = false,
  isSingle = true,
  sender 
}: MessageBubbleProps) {
  const isSystem = message.message_type === 'system';
  
  if (isSystem) {
    return (
      <div className="flex justify-center my-4">
        <span className="text-xs text-signal-text-tertiary bg-black/5 px-3 py-1 rounded-full">
          {message.content}
        </span>
      </div>
    );
  }

  // Calculate border radius based on position in a message group
  let radiusClass = "";
  if (isSentByMe) {
    if (isSingle) radiusClass = "rounded-l-[18px] rounded-tr-[18px] rounded-br-[4px]";
    else if (isFirst) radiusClass = "rounded-l-[18px] rounded-tr-[18px] rounded-br-[4px]";
    else if (isMiddle) radiusClass = "rounded-l-[18px] rounded-r-[4px]";
    else if (isLast) radiusClass = "rounded-l-[18px] rounded-tr-[4px] rounded-br-[4px]";
  } else {
    if (isSingle) radiusClass = "rounded-r-[18px] rounded-tl-[18px] rounded-bl-[4px]";
    else if (isFirst) radiusClass = "rounded-r-[18px] rounded-tl-[18px] rounded-bl-[4px]";
    else if (isMiddle) radiusClass = "rounded-r-[18px] rounded-l-[4px]";
    else if (isLast) radiusClass = "rounded-r-[18px] rounded-tl-[4px] rounded-bl-[4px]";
  }

  // Add margin-top if it's the first message in a group (to separate from previous block)
  const marginTopClass = (isFirst || isSingle) ? "mt-2" : "mt-[2px]";

  return (
    <div className={`flex ${isSentByMe ? 'justify-end' : 'justify-start'} ${marginTopClass} relative group`}>
      <div 
        className={`max-w-[75%] px-3 py-1.5 flex flex-col relative
          ${isSentByMe 
            ? `bg-signal-bubble-sent text-signal-text-sent ${radiusClass} shadow-sm`
            : `bg-signal-bubble-received text-signal-text-received ${radiusClass} shadow-sm border border-black/5`
          }
        `}
      >
        {!isSentByMe && sender && message.message_type !== 'system' && (isFirst || isSingle) && (
          <span className="text-[12px] font-semibold text-signal-blue mb-0.5">{sender.display_name}</span>
        )}
        <div className="flex flex-wrap items-end justify-between gap-x-3 gap-y-1">
          <span className="text-[14.5px] leading-[20px] whitespace-pre-wrap break-words max-w-full">{message.content}</span>
          
          <div className={`flex items-center gap-1 shrink-0 ml-auto select-none mt-1
            ${isSentByMe ? 'text-white/70' : 'text-signal-text-tertiary'}
          `}>
            <span className="text-[11px] leading-none">{formatMessageTime(message.created_at)}</span>
            {isSentByMe && <MessageStatusIcon status={message.status} />}
          </div>
        </div>
      </div>
    </div>
  );
}
