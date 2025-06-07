import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ChatState, ChatUser, Message, SocketMessage } from "../../types/chat";

const initialState: ChatState = {
  users: [],
  conversations: [],
  messages: [],
  activeConversation: null,
  onlineUsers: [],
  isLoading: false,
  error: null,
  isTyping: false,
  typingUser: null,
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setActiveConversation: (state, action: PayloadAction<string | null>) => {
      state.activeConversation = action.payload;
    },
    addMessage: (state, action: PayloadAction<Message | SocketMessage>) => {
      const message = action.payload;
      const existingIndex = state.messages.findIndex(
        (m) => m._id === message._id
      );
      if (existingIndex === -1) {
        state.messages.push(message);
      }
    },
    setOnlineUsers: (state, action: PayloadAction<string[]>) => {
      state.onlineUsers = action.payload;
    },
    addOnlineUser: (state, action: PayloadAction<string>) => {
      if (!state.onlineUsers.includes(action.payload)) {
        state.onlineUsers.push(action.payload);
      }
    },
    removeOnlineUser: (state, action: PayloadAction<string>) => {
      state.onlineUsers = state.onlineUsers.filter(
        (id) => id !== action.payload
      );
    },
    setTyping: (
      state,
      action: PayloadAction<{ userId: string; isTyping: boolean }>
    ) => {
      state.isTyping = action.payload.isTyping;
      state.typingUser = action.payload.isTyping ? action.payload.userId : null;
    },
    clearMessages: (state) => {
      state.messages = [];
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setActiveConversation,
  addMessage,
  setOnlineUsers,
  addOnlineUser,
  removeOnlineUser,
  setTyping,
  clearMessages,
  setError,
  clearError,
} = chatSlice.actions;

export default chatSlice.reducer;
