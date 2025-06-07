const User = require("../models/User");
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const { emitToUser } = require("../socket/socketHandler");

// @desc    Get all users except current user (for chat selection)
// @route   GET /api/chat/users
// @access  Private
const getUsers = async (req, res, next) => {
  try {
    const currentUserId = req.user._id;

    const users = await User.find({ _id: { $ne: currentUserId } })
      .select("username email")
      .sort({ username: 1 });

    res.json({
      status: "success",
      data: {
        users,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all conversations for logged-in user
// @route   GET /api/chat/conversations
// @access  Private
const getConversations = async (req, res, next) => {
  try {
    const currentUserId = req.user._id;

    const conversations = await Conversation.find({
      participants: currentUserId,
    })
      .populate("participants", "username email")
      .populate({
        path: "lastMessage",
        select: "text createdAt sender",
        populate: {
          path: "sender",
          select: "username",
        },
      })
      .sort({ updatedAt: -1 });

    // Format conversations to include other participant info
    const formattedConversations = conversations.map((conversation) => {
      const otherParticipant = conversation.participants.find(
        (participant) => participant._id.toString() !== currentUserId.toString()
      );

      return {
        _id: conversation._id,
        otherParticipant: {
          _id: otherParticipant._id,
          username: otherParticipant.username,
          email: otherParticipant.email,
        },
        lastMessage: conversation.lastMessage,
        updatedAt: conversation.updatedAt,
      };
    });

    res.json({
      status: "success",
      data: {
        conversations: formattedConversations,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all messages in a conversation
// @route   GET /api/chat/messages/:conversationId
// @access  Private
const getMessages = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const currentUserId = req.user._id;

    // Verify user is part of the conversation
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: currentUserId,
    });

    if (!conversation) {
      return res.status(404).json({
        status: "error",
        message: "Conversation not found or access denied",
      });
    }

    const messages = await Message.find({ conversationId })
      .populate("sender", "username")
      .populate("recipient", "username")
      .sort({ createdAt: 1 });

    res.json({
      status: "success",
      data: {
        messages,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Send a message
// @route   POST /api/chat/messages
// @access  Private
const sendMessage = async (req, res, next) => {
  try {
    const { recipientId, text } = req.body;
    const senderId = req.user._id;

    // Validate input
    if (!recipientId || !text) {
      return res.status(400).json({
        status: "error",
        message: "Recipient ID and message text are required",
      });
    }

    if (text.trim().length === 0) {
      return res.status(400).json({
        status: "error",
        message: "Message text cannot be empty",
      });
    }

    // Check if recipient exists
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({
        status: "error",
        message: "Recipient not found",
      });
    }

    // Check if sender is trying to message themselves
    if (senderId.toString() === recipientId.toString()) {
      return res.status(400).json({
        status: "error",
        message: "Cannot send message to yourself",
      });
    }

    // Find or create conversation
    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, recipientId] },
    });

    if (!conversation) {
      conversation = new Conversation({
        participants: [senderId, recipientId],
      });
      await conversation.save();
    }

    // Create message
    const message = new Message({
      conversationId: conversation._id,
      sender: senderId,
      recipient: recipientId,
      text: text.trim(),
    });

    await message.save();

    // Update conversation's lastMessage
    conversation.lastMessage = message._id;
    conversation.updatedAt = new Date();
    await conversation.save();

    // Populate message for response
    await message.populate("sender", "username");
    await message.populate("recipient", "username");

    // Emit real-time message to recipient if online
    const messageData = {
      _id: message._id,
      conversationId: conversation._id,
      sender: {
        _id: message.sender._id,
        username: message.sender.username,
      },
      recipient: {
        _id: message.recipient._id,
        username: message.recipient.username,
      },
      text: message.text,
      createdAt: message.createdAt,
    };

    // Try to emit to recipient via Socket.IO
    const recipientNotified = emitToUser(
      req.app.get("io"),
      recipientId.toString(),
      "newMessage",
      messageData
    );

    // Return the message data for Socket.IO emission
    res.status(201).json({
      status: "success",
      message: "Message sent successfully",
      data: {
        message: messageData,
        conversationId: conversation._id,
        recipientOnline: recipientNotified,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsers,
  getConversations,
  getMessages,
  sendMessage,
};
