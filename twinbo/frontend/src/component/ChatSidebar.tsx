import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "../store";
import { useGetUsersQuery } from "../slices/chat/chatApiSlice";

interface ChatSidebarProps {
  onSelectUser: (userId: string, username: string) => void;
  selectedUserId: string | null;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({
  onSelectUser,
  selectedUserId,
}) => {
  const { userInfo } = useSelector((state: RootState) => state.authReducer);
  const { onlineUsers } = useSelector((state: RootState) => state.chatReducer);
  const { data: usersResponse, isLoading, error } = useGetUsersQuery();

  const users = usersResponse?.data?.users || [];

  if (isLoading) {
    return (
      <div className="w-full h-full bg-gray-50 dark:bg-gray-900 p-4">
        <div className="animate-pulse">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full bg-gray-50 dark:bg-gray-900 p-4">
        <div className="text-center text-red-500">
          Failed to load users. Please try again.
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700">
      {/* Current User Info */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center">
            <span className="text-white font-medium">
              {userInfo?.username?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white">
              {userInfo?.username}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Online</p>
          </div>
        </div>
      </div>

      {/* Users List */}
      <div className="p-4">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Users ({users.length})
        </h4>
        <div className="space-y-2">
          {users.map((user) => {
            const isOnline = onlineUsers.includes(user._id);
            const isSelected = selectedUserId === user._id;

            return (
              <button
                key={user._id}
                onClick={() => onSelectUser(user._id, user.username)}
                className={`w-full flex items-center space-x-3 p-3 rounded-lg transition duration-200 ${
                  isSelected
                    ? "bg-emerald-100 dark:bg-emerald-900"
                    : "hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                <div className="relative">
                  <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium">
                      {user.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  {isOnline && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full"></div>
                  )}
                </div>
                <div className="flex-1 text-left">
                  <h5 className="font-medium text-gray-900 dark:text-white">
                    {user.username}
                  </h5>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {isOnline ? "Online" : "Offline"}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {users.length === 0 && (
          <div className="text-center text-gray-500 dark:text-gray-400 py-8">
            No other users found
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatSidebar;
