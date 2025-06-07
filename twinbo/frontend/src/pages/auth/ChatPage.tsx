import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import Header from "../../component/Header";
import ChatSidebar from "../../component/ChatSidebar";
import ChatArea from "../../component/ChatArea";
import socketService from "../../services/socketService";

const ChatPage = () => {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedUsername, setSelectedUsername] = useState<string | null>(null);
  const { userInfo } = useSelector((state: RootState) => state.authReducer);

  useEffect(() => {
    // Initialize socket connection when component mounts
    if (userInfo?.token) {
      socketService.connect(userInfo.token);

      // Set up socket event listeners here
      socketService.onUserOnline((userId) => {
        console.log("User came online:", userId);
        // You can dispatch actions to update Redux state here
      });

      socketService.onUserOffline((userId) => {
        console.log("User went offline:", userId);
        // You can dispatch actions to update Redux state here
      });

      socketService.onMessage((message) => {
        console.log("New message received:", message);
        // You can dispatch actions to update Redux state here
      });

      // Cleanup on component unmount
      return () => {
        socketService.disconnect();
      };
    }
  }, [userInfo?.token]);

  const handleSelectUser = (userId: string, username: string) => {
    setSelectedUserId(userId);
    setSelectedUsername(username);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />

      <div className="flex h-[calc(100vh-4rem)]">
        {/* Sidebar - 20% width */}
        <div className="w-1/5 min-w-[300px]">
          <ChatSidebar
            onSelectUser={handleSelectUser}
            selectedUserId={selectedUserId}
          />
        </div>

        {/* Chat Area - 80% width */}
        <div className="flex-1">
          <ChatArea
            selectedUserId={selectedUserId}
            selectedUsername={selectedUsername}
          />
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
