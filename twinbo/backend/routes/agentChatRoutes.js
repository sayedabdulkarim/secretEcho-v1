const express = require("express");
const {
  sendMessage,
  getChatHistory,
} = require("../controllers/agentChatController");
const { authenticate } = require("../middleware/auth");

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// POST /ai-agent/message - Send message to AI agent
router.post("/message", sendMessage);

// GET /ai-agent/history - Get chat history with AI agent
router.get("/history", getChatHistory);

module.exports = router;
