// User types
export interface User {
  id: string;
  username: string;
  phone: string | null;
  display_name: string;
  avatar_url: string | null;
  status_text: string | null;
  last_seen: string;
  is_online: boolean;
  created_at: string;
}

// Conversation types
export type ConversationType = "dm" | "group";
export type MemberRole = "member" | "admin";

export interface ConversationMember {
  id: string;
  user_id: string;
  role: MemberRole;
  joined_at: string;
  last_read_at: string | null;
  user: User;
}

export interface Conversation {
  id: string;
  type: ConversationType;
  name: string | null;
  avatar_url: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  members: ConversationMember[];
  last_message: Message | null;
  unread_count: number;
}

// Message types
export type MessageType = "text" | "system" | "image";
export type MessageStatus = "sending" | "sent" | "delivered" | "read";

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  message_type: MessageType;
  status: MessageStatus;
  reply_to_id: string | null;
  reply_to: Message | null;
  created_at: string;
  updated_at: string;
  sender?: User;
}

// Contact types
export interface Contact {
  id: string;
  user_id: string;
  contact_user_id: string;
  nickname: string | null;
  created_at: string;
  contact_user: User;
}

// Auth types
export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  phone?: string;
  password: string;
}

export interface VerifyOTPRequest {
  username: string;
  otp: string;
}

export interface ProfileUpdateRequest {
  display_name: string;
  avatar_url?: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

// WebSocket message types
export type WSMessageType =
  | "new_message"
  | "typing"
  | "read_receipt"
  | "message_status"
  | "user_online"
  | "error";

export interface WSMessage {
  type: WSMessageType;
  [key: string]: unknown;
}

export interface WSNewMessage extends WSMessage {
  type: "new_message";
  message: Message;
}

export interface WSTyping extends WSMessage {
  type: "typing";
  conversation_id: string;
  user_id: string;
  is_typing: boolean;
}

export interface WSReadReceipt extends WSMessage {
  type: "read_receipt";
  conversation_id: string;
  user_id: string;
  message_id: string;
}

export interface WSMessageStatus extends WSMessage {
  type: "message_status";
  message_id: string;
  status: MessageStatus;
}

export interface WSUserOnline extends WSMessage {
  type: "user_online";
  user_id: string;
  is_online: boolean;
}
