const Message = require("../models/Message");
const Conversation = require("../models/Conversation");
const User = require("../models/User");

describe("Message Model", () => {
  let testUser1, testUser2, testConversation;

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

    // Create test conversation
    testConversation = await Conversation.create({
      participants: [testUser1._id, testUser2._id],
    });
  });

  describe("Message Creation", () => {
    it("should create a message with valid data", async () => {
      const messageData = {
        conversationId: testConversation._id,
        sender: testUser1._id,
        recipient: testUser2._id,
        text: "Hello, how are you?",
      };

      const message = await Message.create(messageData);

      expect(message._id).toBeDefined();
      expect(message.conversationId.toString()).toBe(
        testConversation._id.toString()
      );
      expect(message.sender.toString()).toBe(testUser1._id.toString());
      expect(message.recipient.toString()).toBe(testUser2._id.toString());
      expect(message.text).toBe(messageData.text);
      expect(message.createdAt).toBeDefined();
      expect(message.updatedAt).toBeDefined();
    });

    it("should require conversationId", async () => {
      const messageData = {
        sender: testUser1._id,
        recipient: testUser2._id,
        text: "Hello!",
      };

      await expect(Message.create(messageData)).rejects.toThrow();
    });

    it("should require sender", async () => {
      const messageData = {
        conversationId: testConversation._id,
        recipient: testUser2._id,
        text: "Hello!",
      };

      await expect(Message.create(messageData)).rejects.toThrow();
    });

    it("should require recipient", async () => {
      const messageData = {
        conversationId: testConversation._id,
        sender: testUser1._id,
        text: "Hello!",
      };

      await expect(Message.create(messageData)).rejects.toThrow();
    });

    it("should require text", async () => {
      const messageData = {
        conversationId: testConversation._id,
        sender: testUser1._id,
        recipient: testUser2._id,
      };

      await expect(Message.create(messageData)).rejects.toThrow();
    });

    it("should trim whitespace from text", async () => {
      const messageData = {
        conversationId: testConversation._id,
        sender: testUser1._id,
        recipient: testUser2._id,
        text: "  Hello, how are you?  ",
      };

      const message = await Message.create(messageData);

      expect(message.text).toBe("Hello, how are you?");
    });

    it("should enforce maximum text length", async () => {
      const longText = "a".repeat(1001); // Exceeds 1000 character limit
      const messageData = {
        conversationId: testConversation._id,
        sender: testUser1._id,
        recipient: testUser2._id,
        text: longText,
      };

      await expect(Message.create(messageData)).rejects.toThrow();
    });

    it("should allow text at maximum length", async () => {
      const maxText = "a".repeat(1000); // Exactly 1000 characters
      const messageData = {
        conversationId: testConversation._id,
        sender: testUser1._id,
        recipient: testUser2._id,
        text: maxText,
      };

      const message = await Message.create(messageData);

      expect(message.text).toBe(maxText);
      expect(message.text.length).toBe(1000);
    });
  });

  describe("Message Queries", () => {
    let message1, message2, message3;

    beforeEach(async () => {
      // Create test messages
      message1 = await Message.create({
        conversationId: testConversation._id,
        sender: testUser1._id,
        recipient: testUser2._id,
        text: "First message",
      });

      message2 = await Message.create({
        conversationId: testConversation._id,
        sender: testUser2._id,
        recipient: testUser1._id,
        text: "Second message",
      });

      message3 = await Message.create({
        conversationId: testConversation._id,
        sender: testUser1._id,
        recipient: testUser2._id,
        text: "Third message",
      });
    });

    it("should find messages by conversation", async () => {
      const messages = await Message.find({
        conversationId: testConversation._id,
      }).sort({ createdAt: 1 });

      expect(messages).toHaveLength(3);
      expect(messages[0].text).toBe("First message");
      expect(messages[1].text).toBe("Second message");
      expect(messages[2].text).toBe("Third message");
    });

    it("should find messages by sender", async () => {
      const messages = await Message.find({ sender: testUser1._id }).sort({
        createdAt: 1,
      });

      expect(messages).toHaveLength(2);
      expect(messages[0].text).toBe("First message");
      expect(messages[1].text).toBe("Third message");
    });

    it("should populate sender and recipient data", async () => {
      const message = await Message.findById(message1._id)
        .populate("sender", "username email")
        .populate("recipient", "username email");

      expect(message.sender.username).toBe("user1");
      expect(message.sender.email).toBe("user1@example.com");
      expect(message.recipient.username).toBe("user2");
      expect(message.recipient.email).toBe("user2@example.com");
    });

    it("should populate conversation data", async () => {
      const message = await Message.findById(message1._id).populate({
        path: "conversationId",
        populate: {
          path: "participants",
          select: "username email",
        },
      });

      expect(message.conversationId.participants).toHaveLength(2);
      expect(message.conversationId.participants[0].username).toBeTruthy();
      expect(message.conversationId.participants[1].username).toBeTruthy();
    });
  });
});
