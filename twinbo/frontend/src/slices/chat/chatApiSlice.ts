import { apiSlice } from "../apiSlice";
import {
  ChatUser,
  Conversation,
  Message,
  SendMessageRequest,
} from "../../types/chat";

export const chatApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query<
      { status: string; data: { users: ChatUser[] } },
      void
    >({
      query: () => ({
        url: "api/chat/users",
        method: "GET",
      }),
      transformResponse: (response: {
        status: string;
        data: { users: ChatUser[] };
      }) => response,
      providesTags: ["User"],
    }),
    getConversations: builder.query<
      { status: string; data: { conversations: Conversation[] } },
      void
    >({
      query: () => ({
        url: "api/chat/conversations",
        method: "GET",
      }),
      transformResponse: (response: {
        status: string;
        data: { conversations: Conversation[] };
      }) => response,
      providesTags: ["Conversation"],
    }),
    getMessages: builder.query<
      { status: string; data: { messages: Message[] } },
      string
    >({
      query: (conversationId) => ({
        url: `api/chat/messages/${conversationId}`,
        method: "GET",
      }),
      transformResponse: (response: {
        status: string;
        data: { messages: Message[] };
      }) => response,
      providesTags: (result, error, conversationId) => [
        { type: "Message", id: conversationId },
      ],
    }),
    sendMessage: builder.mutation<
      { status: string; data: { message: Message } },
      SendMessageRequest
    >({
      query: (data) => ({
        url: "api/chat/messages",
        method: "POST",
        body: data,
      }),
      transformResponse: (response: {
        status: string;
        data: { message: Message };
      }) => response,
      invalidatesTags: ["Conversation", "Message"],
    }),
  }),
});

export const {
  useGetUsersQuery,
  useGetConversationsQuery,
  useGetMessagesQuery,
  useSendMessageMutation,
} = chatApiSlice;
