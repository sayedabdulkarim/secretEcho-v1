import React, { useState, useEffect, useRef, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../store";
import {
  useSendMessageMutation,
  useGetConversationsQuery,
  useGetMessagesQuery,
} from "../slices/chat/chatApiSlice";
import { addMessage } from "../slices/chat/chatSlice";
import socketService from "../services/socketService";

interface ChatAreaProps {
  selectedUserId: string | null;
  selectedUsername: string | null;
}

const ChatArea: React.FC<ChatAreaProps> = ({
  selectedUserId,
  selectedUsername,
}) => {
  const dispatch = useDispatch();
  const [message, setMessage] = useState("");
  const [isUserTyping, setIsUserTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { onlineUsers, messages, isTyping, typingUser } = useSelector(
    (state: RootState) => state.chatReducer
  );
  const { userInfo } = useSelector((state: RootState) => state.authReducer);

  const [sendMessage, { isLoading: isSending }] = useSendMessageMutation();

  // Get conversations to find the conversation between current user and selected user
  const { data: conversationsResponse } = useGetConversationsQuery();
  const conversations = conversationsResponse?.data?.conversations || [];

  // Find conversation between current user and selected user
  const currentConversation = conversations.find(
    (conversation) => conversation.otherParticipant._id === selectedUserId
  );

  // Fetch messages for the current conversation
  const { data: messagesResponse } = useGetMessagesQuery(
    currentConversation?._id || "",
    {
      skip: !currentConversation?._id,
    }
  );

  // Use messages from API if available, otherwise use messages from Redux store
  const apiMessages = useMemo(() => {
    return messagesResponse?.data?.messages || [];
  }, [messagesResponse?.data?.messages]);

  console.log("All Redux messages:", messages);
  console.log("Current user info:", userInfo);
  console.log("Selected user ID:", selectedUserId);
  console.log("Messages count:", messages.length);

  // Debug the actual message structure
  if (messages.length > 0) {
    console.log("Sample message structure:", {
      message: messages[0],
      senderType: typeof messages[0].sender,
      recipientType: typeof messages[0].recipient,
    });
  }

  // Get the current user ID - handle both _id and id properties
  const currentUserId = userInfo?._id || (userInfo as any)?.id;

  console.log("User ID Debug:", {
    userInfo,
    userInfoId: userInfo?._id,
    userInfoIdAlt: (userInfo as any)?.id,
    currentUserId: currentUserId,
  });

  // Memoize the filtered Redux messages to avoid unnecessary re-renders
  const reduxMessages = useMemo(() => {
    if (!selectedUserId || !currentUserId) {
      return [];
    }

    return messages.filter((msg) => {
      // Handle both sender as object and sender as string (in case of different message formats)
      const senderId =
        typeof msg.sender === "object" ? msg.sender._id : msg.sender;
      const recipientId =
        typeof msg.recipient === "object" ? msg.recipient._id : msg.recipient;

      const isFromSelectedUser =
        senderId === selectedUserId && recipientId === currentUserId;
      const isToSelectedUser =
        senderId === currentUserId && recipientId === selectedUserId;

      console.log("Message filter debug:", {
        msgId: msg._id,
        senderId: senderId,
        recipientId: recipientId,
        selectedUserId,
        currentUserId: currentUserId,
        isFromSelectedUser,
        isToSelectedUser,
        shouldInclude: isFromSelectedUser || isToSelectedUser,
        messageText: msg.text,
      });

      return isFromSelectedUser || isToSelectedUser;
    });
  }, [messages, selectedUserId, currentUserId]);

  // Combine API messages with Redux messages, avoiding duplicates
  const currentMessages = useMemo(() => {
    const allMessages = [...apiMessages];
    reduxMessages.forEach((reduxMsg) => {
      if (!allMessages.find((apiMsg) => apiMsg._id === reduxMsg._id)) {
        allMessages.push(reduxMsg);
      }
    });

    // Sort messages by creation date
    return allMessages.sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  }, [apiMessages, reduxMessages]);

  // For now, we'll skip fetching messages until we have a conversation ID
  // This would need to be implemented once conversations are properly set up

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentMessages.length, selectedUserId, isTyping]); // Also scroll on typing indicator changes

  // Debug effect to log state changes
  useEffect(() => {
    console.log("ChatArea State Changed:", {
      selectedUserId,
      selectedUsername,
      conversationId: currentConversation?._id,
      apiMessagesCount: apiMessages.length,
      reduxMessagesCount: reduxMessages.length,
      totalMessagesCount: currentMessages.length,
      userInfo: currentUserId,
    });
  }, [
    selectedUserId,
    selectedUsername,
    currentConversation?._id,
    apiMessages.length,
    reduxMessages.length,
    currentMessages.length,
    currentUserId,
  ]);

  // Additional debug for Redux messages changes
  useEffect(() => {
    console.log("Redux Messages Updated:", {
      totalMessages: messages.length,
      filteredForCurrentChat: reduxMessages.length,
      currentlySelectedUser: selectedUserId,
      currentUserId: currentUserId,
    });

    // Log each message and why it was or wasn't included
    messages.forEach((msg, index) => {
      const senderId =
        typeof msg.sender === "object" ? msg.sender._id : msg.sender;
      const recipientId =
        typeof msg.recipient === "object" ? msg.recipient._id : msg.recipient;
      const isFromSelectedUser =
        senderId === selectedUserId && recipientId === currentUserId;
      const isToSelectedUser =
        senderId === currentUserId && recipientId === selectedUserId;
      const shouldInclude = isFromSelectedUser || isToSelectedUser;

      console.log(`Message ${index + 1}:`, {
        id: msg._id,
        text: msg.text,
        senderId,
        recipientId,
        selectedUserId,
        currentUserId: currentUserId,
        isFromSelected: isFromSelectedUser,
        isToSelected: isToSelectedUser,
        included: shouldInclude,
      });
    });
  }, [messages, reduxMessages.length, selectedUserId, currentUserId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim() || !selectedUserId || isSending) {
      return;
    }

    try {
      // Stop typing indicator when sending message
      if (selectedUserId) {
        socketService.emitTyping(selectedUserId, false);
        setIsUserTyping(false);
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
          typingTimeoutRef.current = null;
        }
      }

      const response = await sendMessage({
        recipientId: selectedUserId,
        text: message.trim(),
      }).unwrap();

      // Add message to local state immediately for better UX
      // The socket event will also add it, but this ensures immediate display
      if (response.data?.message) {
        dispatch(addMessage(response.data.message));
      }

      setMessage("");
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  // Handle typing indicator
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMessage = e.target.value;
    setMessage(newMessage);

    if (selectedUserId) {
      // Start typing indicator if user is typing and not already typing
      if (newMessage.trim() && !isUserTyping) {
        socketService.emitTyping(selectedUserId, true);
        setIsUserTyping(true);
      }

      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Set timeout to stop typing after 2 seconds of no typing
      typingTimeoutRef.current = setTimeout(() => {
        socketService.emitTyping(selectedUserId, false);
        setIsUserTyping(false);
        typingTimeoutRef.current = null;
      }, 2000);

      // If message is empty, stop typing immediately
      if (!newMessage.trim() && isUserTyping) {
        socketService.emitTyping(selectedUserId, false);
        setIsUserTyping(false);
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
          typingTimeoutRef.current = null;
        }
      }
    }
  };

  // Cleanup typing timeout on unmount or when selected user changes
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (selectedUserId && isUserTyping) {
        socketService.emitTyping(selectedUserId, false);
      }
    };
  }, [selectedUserId, isUserTyping]);

  if (!selectedUserId) {
    return (
      <div className="flex-1 h-full flex items-center justify-center bg-white dark:bg-gray-800">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
            Select a conversation
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Choose a user from the sidebar to start chatting
          </p>
        </div>
      </div>
    );
  }

  const isUserOnline = onlineUsers.includes(selectedUserId);

  return (
    <div className="flex-1 flex flex-col h-full bg-white dark:bg-gray-800">
      {/* Chat Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
              <span className="text-white font-medium">
                {selectedUsername?.charAt(0).toUpperCase()}
              </span>
            </div>
            {isUserOnline && (
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full"></div>
            )}
          </div>
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white">
              {selectedUsername}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {isUserOnline ? "Online" : "Offline"}
            </p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {currentMessages.length > 0 ? (
          currentMessages.map((msg) => {
            const senderId =
              typeof msg.sender === "object" ? msg.sender._id : msg.sender;
            const isOwnMessage = senderId === currentUserId;

            console.log("Rendering message:", {
              msgId: msg._id,
              senderId: senderId,
              currentUserId: currentUserId,
              isOwnMessage,
              text: msg.text,
            });

            return (
              <div
                key={msg._id}
                className={`flex ${
                  isOwnMessage ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    isOwnMessage
                      ? "bg-emerald-500 text-white"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white"
                  }`}
                >
                  <p className="text-sm">{msg.text}</p>
                  <p
                    className={`text-xs mt-1 ${
                      isOwnMessage
                        ? "text-emerald-100"
                        : "text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    {new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center text-gray-500 dark:text-gray-400 py-8">
            Start a conversation with {selectedUsername}
          </div>
        )}

        {/* Typing Indicator */}
        {isTyping && typingUser === selectedUserId && (
          <div className="flex justify-start">
            <div className="max-w-xs lg:max-w-md px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700">
              <div className="flex items-center space-x-1">
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  {selectedUsername} is typing
                </span>
                <div className="flex items-center space-x-1">
                  <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"></div>
                  <div
                    className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  ></div>
                  <div
                    className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input - Fixed at bottom */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <form
          onSubmit={handleSendMessage}
          className="flex items-center space-x-3"
        >
          <input
            type="text"
            value={message}
            onChange={handleInputChange}
            placeholder="Type a message..."
            className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 text-sm"
            disabled={isSending}
          />
          <button
            type="submit"
            disabled={!message.trim() || isSending}
            className="flex items-center justify-center w-10 h-10 bg-emerald-600 text-white rounded-full hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 flex-shrink-0"
          >
            {isSending ? (
              <svg
                className="animate-spin w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            ) : (
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatArea;
