export interface ChatUser {
  _id: string;
  username: string;
  email: string;
  isOnline?: boolean;
}

export interface Message {
  _id: string;
  conversationId: string;
  sender: string;
  recipient: string;
  text: string;
  createdAt: string;
}

export interface Conversation {
  _id: string;
  participants: string[];
  lastMessage?: {
    text: string;
    createdAt: string;
    sender: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ChatState {
  users: ChatUser[];
  conversations: Conversation[];
  messages: Message[];
  activeConversation: string | null;
  onlineUsers: string[];
  isLoading: boolean;
  error: string | null;
  isTyping: boolean;
  typingUser: string | null;
}

export interface SendMessageRequest {
  recipientId: string;
  text: string;
}

export interface SocketMessage {
  _id: string;
  conversationId: string;
  sender: string;
  recipient: string;
  text: string;
  createdAt: string;
}
