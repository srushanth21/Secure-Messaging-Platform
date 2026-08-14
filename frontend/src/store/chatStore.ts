import { create } from 'zustand';
import api from '@/lib/api';
import type { Conversation, Contact, User } from '@/types';

interface ChatState {
  conversations: Conversation[];
  contacts: Contact[];
  activeConversationId: string | null;
  isLoading: boolean;
  
  fetchConversations: () => Promise<void>;
  fetchContacts: () => Promise<void>;
  setActiveConversation: (id: string | null) => void;
  createDM: (userId: string) => Promise<Conversation>;
  createGroup: (name: string, memberIds: string[]) => Promise<Conversation>;
  addContact: (username: string) => Promise<void>;
  searchUsers: (q: string) => Promise<User[]>;
  markAsRead: (conversationId: string) => void;
  updateUserOnlineStatus: (userId: string, isOnline: boolean) => void;
  addGroupMembers: (conversationId: string, memberIds: string[]) => Promise<void>;
  removeGroupMember: (conversationId: string, userId: string) => Promise<void>;
}

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  contacts: [],
  activeConversationId: null,
  isLoading: false,

  fetchConversations: async () => {
    set({ isLoading: true });
    try {
      const res = await api.get('/conversations');
      set({ conversations: res.data, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  fetchContacts: async () => {
    try {
      const res = await api.get('/contacts');
      set({ contacts: res.data });
    } catch { /* ignore */ }
  },

  setActiveConversation: (id) => set({ activeConversationId: id }),

  createDM: async (userId) => {
    const res = await api.post(`/conversations/dm/${userId}`);
    const newConv = res.data;
    set((state) => {
      const exists = state.conversations.find(c => c.id === newConv.id);
      if (exists) return state;
      return { conversations: [newConv, ...state.conversations] };
    });
    set({ activeConversationId: newConv.id });
    return newConv;
  },

  createGroup: async (name, memberIds) => {
    const res = await api.post('/conversations/group', { name, member_ids: memberIds });
    const newConv = res.data;
    set((state) => ({ 
      conversations: [newConv, ...state.conversations],
      activeConversationId: newConv.id 
    }));
    return newConv;
  },

  addContact: async (username) => {
    try {
      await api.post('/contacts', { username });
      get().fetchContacts();
    } catch (error: any) {
      // Ignore 400 errors if user is already a contact, otherwise log
      console.warn("Contact could not be added:", error?.response?.data || error.message);
    }
  },

  searchUsers: async (q) => {
    const res = await api.get(`/users/search?q=${encodeURIComponent(q)}`);
    return res.data;
  },

  markAsRead: (conversationId) => {
    set((state) => ({
      conversations: state.conversations.map(c => 
        c.id === conversationId ? { ...c, unread_count: 0 } : c
      )
    }));
  },

  updateUserOnlineStatus: (userId, isOnline) => {
    set((state) => {
      const newConversations = state.conversations.map(conv => {
        // Only update if the user is a member of this conversation
        if (conv.members.some(m => m.user_id === userId)) {
          return {
            ...conv,
            members: conv.members.map(m => 
              m.user_id === userId ? { ...m, user: { ...m.user, is_online: isOnline } } : m
            )
          };
        }
        return conv;
      });
      
      const newContacts = state.contacts.map(c => 
        c.contact_user_id === userId 
          ? { ...c, contact_user: { ...c.contact_user, is_online: isOnline } } 
          : c
      );
      
      return { conversations: newConversations, contacts: newContacts };
    });
  },

  addGroupMembers: async (conversationId, memberIds) => {
    await api.post(`/conversations/${conversationId}/members`, { member_ids: memberIds });
    get().fetchConversations();
  },

  removeGroupMember: async (conversationId, userId) => {
    await api.delete(`/conversations/${conversationId}/members/${userId}`);
    get().fetchConversations();
  },
}));
