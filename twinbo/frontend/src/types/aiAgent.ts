export interface AiAgentMessage {
  role: "user" | "agent";
  message: string;
  timestamp: string;
}

export interface AiAgentChatHistory {
  threadId: string;
  messages: AiAgentMessage[];
}

export interface AiAgentState {
  messages: AiAgentMessage[];
  threadId: string | null;
  isLoading: boolean;
  isSending: boolean;
  error: string | null;
  isModalOpen: boolean;
  inputMessage: string;
}

export interface SendMessageRequest {
  message: string;
}

export interface SendMessageResponse {
  status: string;
  data: {
    prompt: string;
    message: string;
    threadId: string;
    timestamp: string;
  };
}

export interface GetHistoryResponse {
  status: string;
  data: {
    threadId: string;
    messages: AiAgentMessage[];
  };
}
