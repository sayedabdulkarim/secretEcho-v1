import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../store";
import { openModal } from "../slices/ai-agent/aiAgentSlice";

const AiChatAgentIcon: React.FC = () => {
  const dispatch = useDispatch();
  const { isModalOpen } = useSelector(
    (state: RootState) => state.aiAgentReducer
  );

  const handleOpenModal = () => {
    dispatch(openModal());
  };

  return (
    <button
      onClick={handleOpenModal}
      disabled={isModalOpen}
      className="fixed bottom-6 left-6 z-40 group"
      aria-label="Open AI Chat Agent"
    >
      <div className="relative">
        {/* Main icon button */}
        <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center group-hover:from-blue-600 group-hover:to-purple-700 group-disabled:opacity-50 group-disabled:cursor-not-allowed group-disabled:transform-none">
          <svg
            className="w-7 h-7 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
            />
          </svg>
        </div>

        {/* Pulsing ring animation */}
        <div className="absolute inset-0 w-14 h-14 rounded-full bg-blue-400 opacity-75 animate-ping group-disabled:animate-none"></div>

        {/* Tooltip */}
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none">
          AI Chat Agent
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
        </div>
      </div>
    </button>
  );
};

export default AiChatAgentIcon;
