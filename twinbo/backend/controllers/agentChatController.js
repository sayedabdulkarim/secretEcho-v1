const { LLMService, LLMServiceError } = require("../services/llm-service");
const AgentChat = require("../models/AgentChat");
const { v4: uuidv4 } = require("uuid");

const llmService = new LLMService();

// Helper function to generate thread ID based on userId
const generateThreadId = (userId) => {
  return `agent_thread_${userId}`;
};

// Helper function to build conversation context for OpenRouter
const buildConversationContext = (chatHistory) => {
  const messages = [
    {
      role: "system",
      content:
        "You are a helpful AI assistant. Be friendly, informative, and engaging in your responses.",
    },
  ];

  // Add conversation history (limit to maintain context window)
  const recentMessages = chatHistory.slice(-10); // Last 10 messages to stay within token limit

  recentMessages.forEach((chat) => {
    messages.push({
      role: chat.role === "agent" ? "assistant" : "user",
      content: chat.message,
    });
  });

  return messages;
};

// Send message to AI agent
const sendMessage = async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user._id;

    // Validate input
    if (!message || typeof message !== "string" || message.trim() === "") {
      return res.status(400).json({
        status: "error",
        message: "Message is required and cannot be empty",
      });
    }

    // Generate thread ID based on userId
    const threadId = generateThreadId(userId);

    // Get existing chat history for this user's thread
    const chatHistory = await AgentChat.find({
      userId: userId,
      threadId: threadId,
    }).sort({ createdAt: 1 });

    // If no chat history exists, send a welcome message first
    if (chatHistory.length === 0) {
      const welcomeMessage =
        "Hello! I'm your AI assistant. How can I help you today?";

      // Save welcome message from agent
      await AgentChat.create({
        userId: userId,
        threadId: threadId,
        role: "agent",
        message: welcomeMessage,
      });

      // Add welcome message to chat history for context
      chatHistory.push({
        userId: userId,
        threadId: threadId,
        role: "agent",
        message: welcomeMessage,
        createdAt: new Date(),
      });
    }

    // Save user message
    const userChat = await AgentChat.create({
      userId: userId,
      threadId: threadId,
      role: "user",
      message: message.trim(),
    });

    // Build conversation context for OpenRouter
    const conversationMessages = buildConversationContext(chatHistory);

    // Add current user message
    conversationMessages.push({
      role: "user",
      content: message.trim(),
    });

    // Generate AI response
    const aiResponse = await llmService.generateChatResponse(
      conversationMessages,
      400
    );

    // Save AI response
    const agentChat = await AgentChat.create({
      userId: userId,
      threadId: threadId,
      role: "agent",
      message: aiResponse,
    });

    // Return response
    res.status(200).json({
      status: "success",
      data: {
        prompt: message.trim(),
        message: aiResponse,
        threadId: threadId,
        timestamp: agentChat.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Error in sendMessage:", error);

    if (error instanceof LLMServiceError) {
      return res.status(500).json({
        status: "error",
        message: "AI service error: " + error.message,
      });
    }

    res.status(500).json({
      status: "error",
      message: "Internal server error while processing your message",
    });
  }
};

// Get chat history for the user's agent thread
const getChatHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const threadId = generateThreadId(userId);

    const chatHistory = await AgentChat.find({
      userId: userId,
      threadId: threadId,
    }).sort({ createdAt: 1 });

    res.status(200).json({
      status: "success",
      data: {
        threadId: threadId,
        messages: chatHistory.map((chat) => ({
          role: chat.role,
          message: chat.message,
          timestamp: chat.createdAt.toISOString(),
        })),
      },
    });
  } catch (error) {
    console.error("Error in getChatHistory:", error);
    res.status(500).json({
      status: "error",
      message: "Internal server error while fetching chat history",
    });
  }
};

module.exports = {
  sendMessage,
  getChatHistory,
};
