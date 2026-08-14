'use client';
import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useChatStore } from '@/store/chatStore';
import { Message } from '@/types';
import api from '@/lib/api';
import { wsClient } from '@/lib/websocket';
import ChatHeader from '@/components/chat/ChatHeader';
import MessageBubble from '@/components/chat/MessageBubble';
import MessageInput from '@/components/chat/MessageInput';
import Spinner from '@/components/ui/Spinner';

export default function ChatView() {
  const { conversationId } = useParams();
  const currentUser = useAuthStore(s => s.user);
  const { conversations, fetchConversations, markAsRead } = useChatStore();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const conversation = conversations.find(c => c.id === conversationId);

  useEffect(() => {
    if (!conversation) {
      fetchConversations();
    }
  }, [conversation, fetchConversations]);

  useEffect(() => {
    async function loadMessages() {
      setLoading(true);
      try {
        const res = await api.get(`/conversations/${conversationId}/messages`);
        const msgs = res.data;
        setMessages(msgs);
        
        // Mark as read
        if (msgs.length > 0 && currentUser) {
          const lastMsg = msgs[msgs.length - 1];
          wsClient.send({
            type: 'read_receipt',
            conversation_id: conversationId,
            message_id: lastMsg.id
          });
        }
        if (typeof conversationId === 'string') {
          markAsRead(conversationId);
        }
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    }
    
    if (conversationId) {
      loadMessages();
    }
  }, [conversationId]);

  useEffect(() => {
    // Listen for new WS messages
    const unsubscribe = wsClient.onMessage((data) => {
      if (data.type === 'new_message' && data.message.conversation_id === conversationId) {
        setMessages(prev => {
          // Check if it already exists to prevent dupes (from optimistic UI)
          if (prev.some(m => m.id === data.message.id)) {
            return prev.map(m => m.id === data.message.id ? data.message : m);
          }
          return [...prev, data.message];
        });
        
        // Mark as read immediately since the chat is open
        wsClient.send({
          type: 'read_receipt',
          conversation_id: conversationId,
          message_id: data.message.id
        });
        if (typeof conversationId === 'string') {
          markAsRead(conversationId);
        }
      } else if (data.type === 'message_status' && data.status) {
        setMessages(prev => prev.map(m => 
          m.id === data.message_id ? { ...m, status: data.status } : m
        ));
      } else if (data.type === 'typing' && data.conversation_id === conversationId) {
        setTypingUsers(prev => {
          const next = new Set(prev);
          if (data.is_typing) {
            next.add(data.user_id);
          } else {
            next.delete(data.user_id);
          }
          return next;
        });
      }
    });
    return () => { unsubscribe(); };
  }, [conversationId, markAsRead]);

  // Scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'auto' });
    }
  }, [messages, loading, typingUsers]);

  const handleSend = (text: string) => {
    if (!currentUser) return;
    
    // Send via WS
    wsClient.send({
      type: 'new_message',
      conversation_id: conversationId,
      content: text
    });
    
    // In a real app we'd add an optimistic message here
  };

  const handleTyping = (isTyping: boolean) => {
    if (!currentUser) return;
    wsClient.send({
      type: 'typing',
      conversation_id: conversationId,
      is_typing: isTyping
    });
  };

  if (!currentUser || !conversation) {
    return <div className="flex-1 flex justify-center items-center"><Spinner /></div>;
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-signal-bg-chat relative">
      <ChatHeader conversation={conversation} currentUser={currentUser} typingUsers={Array.from(typingUsers)} />
      
      <div 
        ref={containerRef}
        className="flex-1 overflow-y-auto px-4 lg:px-8 py-4 flex flex-col"
      >
        {loading ? (
          <div className="flex justify-center my-4"><Spinner /></div>
        ) : (
          messages.map((msg, index) => {
            const isSentByMe = msg.sender_id === currentUser.id;
            
            const prevMsg = index > 0 ? messages[index - 1] : null;
            const nextMsg = messages[index + 1];
            
            const FIVE_MINUTES = 5 * 60 * 1000;
            const msgTime = new Date(msg.created_at).getTime();
            const prevTime = prevMsg ? new Date(prevMsg.created_at).getTime() : 0;
            const nextTime = nextMsg ? new Date(nextMsg.created_at).getTime() : 0;
            
            const isSameAsPrev = !!(prevMsg && prevMsg.sender_id === msg.sender_id && prevMsg.message_type !== 'system' && (msgTime - prevTime < FIVE_MINUTES));
            const isSameAsNext = !!(nextMsg && nextMsg.sender_id === msg.sender_id && nextMsg.message_type !== 'system' && (nextTime - msgTime < FIVE_MINUTES));
            
            const isFirst = !isSameAsPrev && isSameAsNext;
            const isLast = isSameAsPrev && !isSameAsNext;
            const isMiddle = isSameAsPrev && isSameAsNext;
            const isSingle = !isSameAsPrev && !isSameAsNext;
            
            // Look up sender from conversation members for group chats
            const senderMember = conversation.type === 'group' 
              ? conversation.members.find(m => m.user_id === msg.sender_id)
              : undefined;
            
            return (
              <MessageBubble 
                key={msg.id} 
                message={msg} 
                isSentByMe={isSentByMe} 
                isFirst={isFirst}
                isMiddle={isMiddle}
                isLast={isLast}
                isSingle={isSingle}
                sender={senderMember?.user}
              />
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <MessageInput onSend={handleSend} onTyping={handleTyping} />
    </div>
  );
}
