import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useChatStore } from '@/store/chatStore';
import { wsClient } from '@/lib/websocket';
import type { WSMessage, WSNewMessage, WSTyping, WSMessageStatus } from '@/types';

export function useWebSocketInit() {
  const token = useAuthStore(s => s.token);
  const { fetchConversations } = useChatStore();
  
  // Create a ref to store a stable addMessage function that updates the store without being a dependency loop
  const addMessage = (msg: any) => {
    useChatStore.setState(state => {
      // Very simplified update logic to avoid infinite rerenders
      fetchConversations(); // Just trigger a re-fetch of convos to update sidebar
      return state; 
    });
  };

  useEffect(() => {
    if (token) {
      wsClient.connect(token);
      
      const unsubscribe = wsClient.onMessage((data: WSMessage) => {
        if (data.type === 'new_message') {
          const msg = (data as WSNewMessage).message;
          // In a real app we'd dispatch to chatStore's messages dictionary
          addMessage(msg);
        } else if (data.type === 'message_status') {
          // Handle status update
        } else if (data.type === 'typing') {
          // Handle typing
        } else if (data.type === 'user_online') {
          const { user_id, is_online } = data as any;
          useChatStore.getState().updateUserOnlineStatus(user_id, is_online);
        }
      });
      
      return () => {
        unsubscribe();
        wsClient.disconnect();
      };
    }
  }, [token, fetchConversations]);
}
