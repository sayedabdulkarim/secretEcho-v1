const request = require("supertest");
const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const chatRoutes = require("../routes/chatRoutes");
const { authenticate } = require("../middleware/auth");
const { errorHandler } = require("../middleware/errorHandler");

// Create Express app for testing
const app = express();
app.use(express.json());
app.use("/api/chat", authenticate, chatRoutes);
app.use(errorHandler);

describe("Chat Controller", () => {
  let testUser1, testUser2;
  let validToken1, validToken2;
  let conversation;

  beforeEach(async () => {
    // Create test users
    testUser1 = await User.create({
      username: "user1",
      email: "user1@example.com",
      password: "password123",
    });

    testUser2 = await User.create({
      username: "user2",
      email: "user2@example.com",
      password: "password123",
    });

    // Generate valid tokens
    validToken1 = jwt.sign({ userId: testUser1._id }, process.env.JWT_SECRET);
    validToken2 = jwt.sign({ userId: testUser2._id }, process.env.JWT_SECRET);

    // Create a conversation between users
    conversation = await Conversation.create({
      participants: [testUser1._id, testUser2._id],
    });
  });

  describe("GET /api/chat/users", () => {
    it("should get all users except current user", async () => {
      const response = await request(app)
        .get("/api/chat/users")
        .set("Authorization", `Bearer ${validToken1}`)
        .expect(200);

      expect(response.body.status).toBe("success");
      expect(response.body.data.users).toHaveLength(1);
      expect(response.body.data.users[0].username).toBe("user2");
      expect(response.body.data.users[0].email).toBe("user2@example.com");
      expect(response.body.data.users[0].password).toBeUndefined();
    });

    it("should require authentication", async () => {
      const response = await request(app).get("/api/chat/users").expect(401);

      expect(response.body.status).toBe("error");
    });
  });

  describe("GET /api/chat/conversations", () => {
    it("should get conversations for authenticated user", async () => {
      // Add a message to the conversation to make it show up
      await Message.create({
        conversationId: conversation._id,
        sender: testUser1._id,
        recipient: testUser2._id,
        text: "Hello there!",
      });

      const response = await request(app)
        .get("/api/chat/conversations")
        .set("Authorization", `Bearer ${validToken1}`)
        .expect(200);

      expect(response.body.status).toBe("success");
      expect(response.body.data.conversations).toHaveLength(1);
      expect(response.body.data.conversations[0]._id).toBe(
        conversation._id.toString()
      );
    });

    it("should return empty array if no conversations exist", async () => {
      // Delete the conversation created in beforeEach for this test
      await Conversation.deleteMany({});

      const response = await request(app)
        .get("/api/chat/conversations")
        .set("Authorization", `Bearer ${validToken1}`)
        .expect(200);

      expect(response.body.status).toBe("success");
      expect(response.body.data.conversations).toHaveLength(0);
    });

    it("should require authentication", async () => {
      const response = await request(app)
        .get("/api/chat/conversations")
        .expect(401);

      expect(response.body.status).toBe("error");
    });
  });

  describe("GET /api/chat/messages/:conversationId", () => {
    let message1, message2;

    beforeEach(async () => {
      // Create test messages
      message1 = await Message.create({
        conversationId: conversation._id,
        sender: testUser1._id,
        recipient: testUser2._id,
        text: "Hello!",
      });

      message2 = await Message.create({
        conversationId: conversation._id,
        sender: testUser2._id,
        recipient: testUser1._id,
        text: "Hi there!",
      });
    });

    it("should get messages for a conversation", async () => {
      const response = await request(app)
        .get(`/api/chat/messages/${conversation._id}`)
        .set("Authorization", `Bearer ${validToken1}`)
        .expect(200);

      expect(response.body.status).toBe("success");
      expect(response.body.data.messages).toHaveLength(2);
      expect(response.body.data.messages[0].text).toBe("Hello!");
      expect(response.body.data.messages[1].text).toBe("Hi there!");
    });

    it("should only allow participants to view messages", async () => {
      // Create another user who is not part of the conversation
      const otherUser = await User.create({
        username: "otheruser",
        email: "other@example.com",
        password: "password123",
      });

      const otherToken = jwt.sign(
        { userId: otherUser._id },
        process.env.JWT_SECRET
      );

      const response = await request(app)
        .get(`/api/chat/messages/${conversation._id}`)
        .set("Authorization", `Bearer ${otherToken}`)
        .expect(404);

      expect(response.body.status).toBe("error");
      expect(response.body.message).toBe(
        "Conversation not found or access denied"
      );
    });

    it("should return 404 for non-existent conversation", async () => {
      const fakeId = "507f1f77bcf86cd799439011";

      const response = await request(app)
        .get(`/api/chat/messages/${fakeId}`)
        .set("Authorization", `Bearer ${validToken1}`)
        .expect(404);

      expect(response.body.status).toBe("error");
      expect(response.body.message).toBe(
        "Conversation not found or access denied"
      );
    });

    it("should require authentication", async () => {
      const response = await request(app)
        .get(`/api/chat/messages/${conversation._id}`)
        .expect(401);

      expect(response.body.status).toBe("error");
    });
  });

  describe("POST /api/chat/messages", () => {
    it("should send a message successfully", async () => {
      const messageData = {
        recipientId: testUser2._id.toString(),
        text: "Hello from test!",
      };

      const response = await request(app)
        .post("/api/chat/messages")
        .set("Authorization", `Bearer ${validToken1}`)
        .send(messageData)
        .expect(201);

      expect(response.body.status).toBe("success");
      expect(response.body.message).toBe("Message sent successfully");
      expect(response.body.data.message.text).toBe(messageData.text);
      expect(response.body.data.message.sender._id).toBe(
        testUser1._id.toString()
      );
    });

    it("should create new conversation if none exists", async () => {
      // Create a third user
      const user3 = await User.create({
        username: "user3",
        email: "user3@example.com",
        password: "password123",
      });

      const messageData = {
        recipientId: user3._id.toString(),
        text: "First message!",
      };

      const response = await request(app)
        .post("/api/chat/messages")
        .set("Authorization", `Bearer ${validToken1}`)
        .send(messageData)
        .expect(201);

      expect(response.body.status).toBe("success");
      expect(response.body.data.message.text).toBe(messageData.text);

      // Verify conversation was created
      const newConversation = await Conversation.findById(
        response.body.data.conversationId
      );
      expect(newConversation.participants).toContainEqual(testUser1._id);
      expect(newConversation.participants).toContainEqual(user3._id);
    });

    it("should not send message to non-existent user", async () => {
      const fakeId = "507f1f77bcf86cd799439011";
      const messageData = {
        recipientId: fakeId,
        text: "Hello!",
      };

      const response = await request(app)
        .post("/api/chat/messages")
        .set("Authorization", `Bearer ${validToken1}`)
        .send(messageData)
        .expect(404);

      expect(response.body.status).toBe("error");
      expect(response.body.message).toBe("Recipient not found");
    });

    it("should validate required fields", async () => {
      const response = await request(app)
        .post("/api/chat/messages")
        .set("Authorization", `Bearer ${validToken1}`)
        .send({
          recipientId: testUser2._id.toString(),
          // Missing text
        })
        .expect(400);

      expect(response.body.status).toBe("error");
    });

    it("should require authentication", async () => {
      const response = await request(app)
        .post("/api/chat/messages")
        .send({
          receiverId: testUser2._id.toString(),
          content: "Hello!",
          messageType: "text",
        })
        .expect(401);

      expect(response.body.status).toBe("error");
    });
  });
});
