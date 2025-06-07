import { apiSlice } from "../apiSlice";
import {
  SendMessageRequest,
  SendMessageResponse,
  GetHistoryResponse,
} from "../../types/aiAgent";

export const aiAgentApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAgentChatHistory: builder.query<GetHistoryResponse, void>({
      query: () => ({
        url: "api/ai-agent/history",
        method: "GET",
      }),
      transformResponse: (response: GetHistoryResponse) => response,
      providesTags: ["AiAgentChat"],
    }),
    sendMessageToAgent: builder.mutation<
      SendMessageResponse,
      SendMessageRequest
    >({
      query: (data) => ({
        url: "api/ai-agent/message",
        method: "POST",
        body: data,
      }),
      transformResponse: (response: SendMessageResponse) => response,
      invalidatesTags: ["AiAgentChat"],
    }),
  }),
});

export const {
  useGetAgentChatHistoryQuery,
  useLazyGetAgentChatHistoryQuery,
  useSendMessageToAgentMutation,
} = aiAgentApiSlice;
