import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../store";
import { useSendMessageMutation } from "../slices/chat/chatApiSlice";

interface ChatAreaProps {
  selectedUserId: string | null;
  selectedUsername: string | null;
}

const ChatArea: React.FC<ChatAreaProps> = ({
  selectedUserId,
  selectedUsername,
}) => {
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { onlineUsers } = useSelector((state: RootState) => state.chatReducer);

  const [sendMessage, { isLoading: isSending }] = useSendMessageMutation();

  // For now, we'll skip fetching messages until we have a conversation ID
  // This would need to be implemented once conversations are properly set up

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim() || !selectedUserId || isSending) {
      return;
    }

    try {
      await sendMessage({
        recipientId: selectedUserId,
        text: message.trim(),
      }).unwrap();

      setMessage("");
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

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
        {/* This would be populated with actual messages */}
        <div className="text-center text-gray-500 dark:text-gray-400 py-8">
          Start a conversation with {selectedUsername}
        </div>
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
            onChange={(e) => setMessage(e.target.value)}
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
