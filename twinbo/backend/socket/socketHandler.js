const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Store connected users
const connectedUsers = new Map();

const socketAuth = async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error("Authentication token required"));
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from token
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return next(new Error("User not found"));
    }

    // Attach user to socket
    socket.userId = user._id.toString();
    socket.user = user;

    next();
  } catch (error) {
    next(new Error("Invalid token"));
  }
};

const handleConnection = (io) => {
  return (socket) => {
    console.log(
      `User ${socket.user.username} connected with socket ID: ${socket.id}`
    );

    // Join user to their own room
    socket.join(socket.userId);

    // Store connected user
    connectedUsers.set(socket.userId, {
      socketId: socket.id,
      user: socket.user,
    });

    // Emit online status to all users
    socket.broadcast.emit("userOnline", {
      userId: socket.userId,
      username: socket.user.username,
    });

    // Send list of online users to newly connected user (including themselves)
    const onlineUsers = Array.from(connectedUsers.entries()).map(
      ([userId, data]) => ({
        userId,
        username: data.user.username,
      })
    );

    socket.emit("onlineUsers", onlineUsers);

    // Handle sending messages via socket
    socket.on("sendMessage", async (data) => {
      try {
        const { conversationId, recipientId, messageId } = data;

        // Emit to recipient if they're online
        if (connectedUsers.has(recipientId)) {
          socket.to(recipientId).emit("newMessage", {
            conversationId,
            messageId,
            from: socket.userId,
          });
        }

        // Emit back to sender for confirmation
        socket.emit("messageDelivered", {
          messageId,
          conversationId,
        });
      } catch (error) {
        socket.emit("messageError", {
          error: "Failed to send message",
        });
      }
    });

    // Handle user typing indicators
    socket.on("typing", (data) => {
      const { recipientId, isTyping } = data;

      if (connectedUsers.has(recipientId)) {
        socket.to(recipientId).emit("typing", {
          userId: socket.userId,
          isTyping: isTyping,
        });
      }
    });

    // Handle disconnect
    socket.on("disconnect", () => {
      console.log(`User ${socket.user.username} disconnected`);

      // Remove from connected users
      connectedUsers.delete(socket.userId);

      // Emit offline status to all users
      socket.broadcast.emit("userOffline", {
        userId: socket.userId,
        username: socket.user.username,
      });
    });
  };
};

// Helper function to emit message to specific user
const emitToUser = (io, userId, event, data) => {
  if (connectedUsers.has(userId)) {
    io.to(userId).emit(event, data);
    return true;
  }
  return false;
};

// Helper function to get connected users count
const getConnectedUsersCount = () => {
  return connectedUsers.size;
};

// Helper function to check if user is online
const isUserOnline = (userId) => {
  return connectedUsers.has(userId);
};

module.exports = {
  socketAuth,
  handleConnection,
  emitToUser,
  getConnectedUsersCount,
  isUserOnline,
};
