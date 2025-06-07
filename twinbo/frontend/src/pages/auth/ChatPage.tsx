import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../store";
import Header from "../../component/Header";
import ChatSidebar from "../../component/ChatSidebar";
import ChatArea from "../../component/ChatArea";
import socketService from "../../services/socketService";
import {
  setOnlineUsers,
  addOnlineUser,
  removeOnlineUser,
  addMessage,
  setTyping,
} from "../../slices/chat/chatSlice";

const ChatPage = () => {
  const dispatch = useDispatch();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedUsername, setSelectedUsername] = useState<string | null>(null);
  const { userInfo } = useSelector((state: RootState) => state.authReducer);

  useEffect(() => {
    // Initialize socket connection when component mounts
    if (userInfo?.token) {
      socketService.connect(userInfo.token);

      // Listen for initial online users list
      socketService.onOnlineUsers((users) => {
        console.log("Online users received:", users);
        const userIds = users.map((user) => user.userId);
        dispatch(setOnlineUsers(userIds));
      });

      // Set up socket event listeners here
      socketService.onUserOnline((data) => {
        console.log("User came online:", data);
        dispatch(addOnlineUser(data.userId));
      });

      socketService.onUserOffline((data) => {
        console.log("User went offline:", data);
        dispatch(removeOnlineUser(data.userId));
      });

      socketService.onMessage((message) => {
        console.log("New message received:", message);
        dispatch(addMessage(message));
      });

      // Listen for typing indicators
      socketService.onTyping((data) => {
        console.log("Typing event received:", data);
        dispatch(setTyping(data));
      });

      // Cleanup on component unmount
      return () => {
        socketService.removeTypingListeners();
        socketService.disconnect();
      };
    }
  }, [userInfo?.token, dispatch]);

  const handleSelectUser = (userId: string, username: string) => {
    setSelectedUserId(userId);
    setSelectedUsername(username);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />

      <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
        {/* Sidebar - 20% width */}
        <div className="w-1/5 min-w-[300px] h-full">
          <ChatSidebar
            onSelectUser={handleSelectUser}
            selectedUserId={selectedUserId}
          />
        </div>

        {/* Chat Area - 80% width */}
        <div className="flex-1 h-full">
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
