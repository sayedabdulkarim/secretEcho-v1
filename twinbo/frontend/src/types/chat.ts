export interface ChatUser {
  _id: string;
  username: string;
  email: string;
  isOnline?: boolean;
}

export interface Message {
  _id: string;
  conversationId: string;
  sender: {
    _id: string;
    username: string;
  };
  recipient: {
    _id: string;
    username: string;
  };
  text: string;
  createdAt: string;
}

export interface Conversation {
  _id: string;
  otherParticipant: {
    _id: string;
    username: string;
    email: string;
  };
  lastMessage?: {
    text: string;
    createdAt: string;
    sender: string;
  };
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
  sender: {
    _id: string;
    username: string;
  };
  recipient: {
    _id: string;
    username: string;
  };
  text: string;
  createdAt: string;
}
