import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AiAgentState, AiAgentMessage } from "../../types/aiAgent";

const initialState: AiAgentState = {
  messages: [],
  threadId: null,
  isLoading: false,
  isSending: false,
  error: null,
  isModalOpen: false,
  inputMessage: "",
};

const aiAgentSlice = createSlice({
  name: "aiAgent",
  initialState,
  reducers: {
    openModal: (state) => {
      state.isModalOpen = true;
      state.error = null;
    },
    closeModal: (state) => {
      state.isModalOpen = false;
      state.error = null;
    },
    setInputMessage: (state, action: PayloadAction<string>) => {
      state.inputMessage = action.payload;
    },
    clearInputMessage: (state) => {
      state.inputMessage = "";
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setSending: (state, action: PayloadAction<boolean>) => {
      state.isSending = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    setMessages: (state, action: PayloadAction<AiAgentMessage[]>) => {
      state.messages = action.payload;
    },
    addMessage: (state, action: PayloadAction<AiAgentMessage>) => {
      state.messages.push(action.payload);
    },
    setThreadId: (state, action: PayloadAction<string>) => {
      state.threadId = action.payload;
    },
    clearChat: (state) => {
      state.messages = [];
      state.threadId = null;
      state.inputMessage = "";
      state.error = null;
    },
  },
});

export const {
  openModal,
  closeModal,
  setInputMessage,
  clearInputMessage,
  setLoading,
  setSending,
  setError,
  clearError,
  setMessages,
  addMessage,
  setThreadId,
  clearChat,
} = aiAgentSlice.actions;

export default aiAgentSlice.reducer;
