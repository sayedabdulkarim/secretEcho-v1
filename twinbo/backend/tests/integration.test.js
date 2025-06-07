const request = require("supertest");
const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");

// Import routes and middleware
const authRoutes = require("../routes/authRoutes");
const homeRoutes = require("../routes/homeRoutes");
const chatRoutes = require("../routes/chatRoutes");
const { errorHandler, notFound } = require("../middleware/errorHandler");
const { authenticate } = require("../middleware/auth");

// Create Express app similar to main server
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/home", homeRoutes);
app.use("/api/chat", chatRoutes);

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
    },
  });
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

describe("API Integration Tests", () => {
  let user1Token, user2Token;
  let user1Data, user2Data;

  beforeEach(async () => {
    // Register two test users for each test
    user1Data = {
      username: "integrationuser1",
      email: "integration1@example.com",
      password: "password123",
    };

    user2Data = {
      username: "integrationuser2",
      email: "integration2@example.com",
      password: "password123",
    };

    // Register user 1
    const user1Response = await request(app)
      .post("/api/auth/register")
      .send(user1Data);

    user1Token = user1Response.body.data.token;

    // Register user 2
    const user2Response = await request(app)
      .post("/api/auth/register")
      .send(user2Data);

    user2Token = user2Response.body.data.token;
  });

  describe("Health Check", () => {
    it("should return API status and endpoints", async () => {
      const response = await request(app).get("/").expect(200);

      expect(response.body.status).toBe("success");
      expect(response.body.message).toBe(
        "Authentication & Chat API is running!"
      );
      expect(response.body.endpoints).toBeDefined();
      expect(response.body.endpoints.register).toBe("POST /api/auth/register");
      expect(response.body.endpoints.login).toBe("POST /api/auth/login");
    });
  });

  describe("Complete Authentication Flow", () => {
    it("should complete full auth flow: register -> login -> profile -> logout", async () => {
      const newUser = {
        username: "flowuser",
        email: "flow@example.com",
        password: "password123",
      };

      // Step 1: Register
      const registerResponse = await request(app)
        .post("/api/auth/register")
        .send(newUser)
        .expect(201);

      expect(registerResponse.body.status).toBe("success");
      const token = registerResponse.body.data.token;

      // Step 2: Login
      const loginResponse = await request(app)
        .post("/api/auth/login")
        .send({
          email: newUser.email,
          password: newUser.password,
        })
        .expect(200);

      expect(loginResponse.body.status).toBe("success");

      // Step 3: Get Profile
      const profileResponse = await request(app)
        .get("/api/auth/profile")
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      expect(profileResponse.body.data.user.username).toBe(newUser.username);

      // Step 4: Logout
      const logoutResponse = await request(app)
        .post("/api/auth/logout")
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      expect(logoutResponse.body.status).toBe("success");
    });
  });

  describe("Protected Routes Access", () => {
    it("should access home route with valid token", async () => {
      const response = await request(app)
        .get("/api/home")
        .set("Authorization", `Bearer ${user1Token}`)
        .expect(200);

      expect(response.body.status).toBe("success");
      expect(response.body.data.user).toBe(user1Data.username);
    });

    it("should access chat users with valid token", async () => {
      const response = await request(app)
        .get("/api/chat/users")
        .set("Authorization", `Bearer ${user1Token}`)
        .expect(200);

      expect(response.body.status).toBe("success");
      expect(response.body.data.users).toBeDefined();
      expect(Array.isArray(response.body.data.users)).toBe(true);
    });
  });

  describe("Complete Chat Flow", () => {
    it("should complete full chat flow: get users -> send message -> get conversations -> get messages", async () => {
      // Step 1: Get available users for chat
      const usersResponse = await request(app)
        .get("/api/chat/users")
        .set("Authorization", `Bearer ${user1Token}`)
        .expect(200);

      const availableUsers = usersResponse.body.data.users;
      expect(availableUsers.length).toBeGreaterThan(0);

      const user2 = availableUsers.find(
        (u) => u.username === user2Data.username
      );
      expect(user2).toBeDefined();

      // Step 2: Send a message to user2
      const messageData = {
        recipientId: user2._id,
        text: "Hello from integration test!",
      };

      const sendMessageResponse = await request(app)
        .post("/api/chat/messages")
        .set("Authorization", `Bearer ${user1Token}`)
        .send(messageData)
        .expect(201);

      expect(sendMessageResponse.body.status).toBe("success");
      const conversationId = sendMessageResponse.body.data.conversationId;

      // Step 3: Get conversations for user1
      const conversationsResponse = await request(app)
        .get("/api/chat/conversations")
        .set("Authorization", `Bearer ${user1Token}`)
        .expect(200);

      expect(
        conversationsResponse.body.data.conversations.length
      ).toBeGreaterThan(0);
      const conversation = conversationsResponse.body.data.conversations.find(
        (c) => c._id === conversationId
      );
      expect(conversation).toBeDefined();

      // Step 4: Get messages from the conversation
      const messagesResponse = await request(app)
        .get(`/api/chat/messages/${conversationId}`)
        .set("Authorization", `Bearer ${user1Token}`)
        .expect(200);

      expect(messagesResponse.body.data.messages.length).toBe(1);
      expect(messagesResponse.body.data.messages[0].text).toBe(
        messageData.text
      );

      // Step 5: Send a reply from user2
      // First get users from user2's perspective to find user1
      const user2UsersResponse = await request(app)
        .get("/api/chat/users")
        .set("Authorization", `Bearer ${user2Token}`)
        .expect(200);

      const user1 = user2UsersResponse.body.data.users.find(
        (u) => u.username === user1Data.username
      );
      expect(user1).toBeDefined();

      const replyData = {
        recipientId: user1._id,
        text: "Hello back from user2!",
      };

      const replyResponse = await request(app)
        .post("/api/chat/messages")
        .set("Authorization", `Bearer ${user2Token}`)
        .send(replyData)
        .expect(201);

      expect(replyResponse.body.status).toBe("success");

      // Step 6: Get updated messages
      const updatedMessagesResponse = await request(app)
        .get(`/api/chat/messages/${conversationId}`)
        .set("Authorization", `Bearer ${user1Token}`)
        .expect(200);

      expect(updatedMessagesResponse.body.data.messages.length).toBe(2);
    });
  });

  describe("Error Handling", () => {
    it("should handle 404 for non-existent routes", async () => {
      const response = await request(app).get("/api/nonexistent").expect(404);

      expect(response.body.status).toBe("error");
      expect(response.body.message).toContain("not found");
    });

    it("should handle unauthorized access to protected routes", async () => {
      const response = await request(app).get("/api/home").expect(401);

      expect(response.body.status).toBe("error");
    });

    it("should handle invalid JSON in request body", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send("invalid json")
        .set("Content-Type", "application/json")
        .expect(400);

      // Express will handle this as a bad request
    });
  });

  describe("Security Tests", () => {
    it("should not expose sensitive user data", async () => {
      const response = await request(app)
        .get("/api/auth/profile")
        .set("Authorization", `Bearer ${user1Token}`)
        .expect(200);

      expect(response.body.data.user.password).toBeUndefined();
    });

    it("should reject malformed tokens", async () => {
      const response = await request(app)
        .get("/api/home")
        .set("Authorization", "Bearer malformed.token.here")
        .expect(401);

      expect(response.body.status).toBe("error");
    });

    it("should reject expired tokens", async () => {
      // Create an expired token
      const expiredToken = jwt.sign(
        { userId: "some-user-id" },
        process.env.JWT_SECRET,
        { expiresIn: "-1h" } // Expired 1 hour ago
      );

      const response = await request(app)
        .get("/api/home")
        .set("Authorization", `Bearer ${expiredToken}`)
        .expect(401);

      expect(response.body.status).toBe("error");
    });
  });
});
