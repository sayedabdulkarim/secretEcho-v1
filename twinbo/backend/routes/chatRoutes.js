const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/auth");
const {
  getUsers,
  getConversations,
  getMessages,
  sendMessage,
} = require("../controllers/chatController");

// All chat routes require authentication
router.use(authenticate);

// @route   GET /api/chat/users
router.get("/users", getUsers);

// @route   GET /api/chat/conversations
router.get("/conversations", getConversations);

// @route   GET /api/chat/messages/:conversationId
router.get("/messages/:conversationId", getMessages);

// @route   POST /api/chat/messages
router.post("/messages", sendMessage);

module.exports = router;
