require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const connectDB = require("./config/database");
const authRoutes = require("./routes/authRoutes");
const homeRoutes = require("./routes/homeRoutes");
const chatRoutes = require("./routes/chatRoutes");
const agentChatRoutes = require("./routes/agentChatRoutes");
const { errorHandler, notFound } = require("./middleware/errorHandler");
const { socketAuth, handleConnection } = require("./socket/socketHandler");

const app = express();
const server = http.createServer(app);

// CORS options - Allow both localhost for development and your frontend domain for production
const allowedOrigins = [
  "http://localhost:3000",
  "https://localhost:3000",
  "https://secret-echo-v1.vercel.app",
  process.env.FRONTEND_URL, // Set this environment variable in your deployment
].filter(Boolean); // Remove undefined values

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      // In development, allow all origins
      if (process.env.NODE_ENV !== "production") {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    }
  },
  credentials: true,
};
// CORS middleware MUST come before any routes or body parsers
app.use(cors(corsOptions));

// Socket.IO setup with CORS
const io = new Server(server, {
  cors: {
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        // In development, allow all origins
        if (process.env.NODE_ENV !== "production") {
          callback(null, true);
        } else {
          callback(new Error("Not allowed by CORS"));
        }
      }
    },
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Socket.IO authentication middleware
io.use(socketAuth);

// Socket.IO connection handling
io.on("connection", handleConnection(io));

// Make io instance available to routes
app.set("io", io);

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/home", homeRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/ai-agent", agentChatRoutes);

// Health check route
app.get("/", (req, res) => {
  res.json({
    status: "success",
    message: "Authentication & Chat API is running!",
    endpoints: {
      register: "POST /api/auth/register",
      login: "POST /api/auth/login",
      logout: "POST /api/auth/logout",
      profile: "GET /api/auth/profile",
      home: "GET /api/home (protected)",
      users: "GET /api/chat/users (protected)",
      conversations: "GET /api/chat/conversations (protected)",
      messages: "GET /api/chat/messages/:conversationId (protected)",
      sendMessage: "POST /api/chat/messages (protected)",
      aiAgent: "POST /api/ai-agent/message (protected)",
      aiAgentHistory: "GET /api/ai-agent/history (protected)",
    },
    realTime: {
      socketIO: "WebSocket connection available",
      events: ["newMessage", "userOnline", "userOffline", "typing"],
    },
  });
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5001;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Socket.IO enabled for real-time chat`);
});
