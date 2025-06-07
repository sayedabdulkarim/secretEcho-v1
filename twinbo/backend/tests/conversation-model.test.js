const Conversation = require("../models/Conversation");
const User = require("../models/User");
const Message = require("../models/Message");

describe("Conversation Model", () => {
  let testUser1, testUser2, testUser3;

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

    testUser3 = await User.create({
      username: "user3",
      email: "user3@example.com",
      password: "password123",
    });
  });

  describe("Conversation Creation", () => {
    it("should create a conversation with valid participants", async () => {
      const conversationData = {
        participants: [testUser1._id, testUser2._id],
      };

      const conversation = await Conversation.create(conversationData);

      expect(conversation._id).toBeDefined();
      expect(conversation.participants).toHaveLength(2);
      expect(conversation.participants[0].toString()).toBe(
        testUser1._id.toString()
      );
      expect(conversation.participants[1].toString()).toBe(
        testUser2._id.toString()
      );
      expect(conversation.createdAt).toBeDefined();
      expect(conversation.updatedAt).toBeDefined();
    });

    it("should require participants", async () => {
      const conversationData = {};

      await expect(Conversation.create(conversationData)).rejects.toThrow();
    });

    it("should not allow more than 2 participants", async () => {
      const conversationData = {
        participants: [testUser1._id, testUser2._id, testUser3._id],
      };

      await expect(Conversation.create(conversationData)).rejects.toThrow(
        "Conversation must have exactly 2 participants"
      );
    });

    it("should not allow less than 2 participants", async () => {
      const conversationData = {
        participants: [testUser1._id],
      };

      await expect(Conversation.create(conversationData)).rejects.toThrow(
        "Conversation must have exactly 2 participants"
      );
    });

    it("should not allow duplicate participants", async () => {
      const conversationData = {
        participants: [testUser1._id, testUser1._id],
      };

      await expect(Conversation.create(conversationData)).rejects.toThrow(
        "Participants must be different users"
      );
    });

    it("should allow setting lastMessage", async () => {
      const conversation = await Conversation.create({
        participants: [testUser1._id, testUser2._id],
      });

      const message = await Message.create({
        conversationId: conversation._id,
        sender: testUser1._id,
        recipient: testUser2._id,
        text: "Hello!",
      });

      conversation.lastMessage = message._id;
      await conversation.save();

      expect(conversation.lastMessage.toString()).toBe(message._id.toString());
    });
  });

  describe("Conversation Queries", () => {
    let conversation1, conversation2;

    beforeEach(async () => {
      // Create test conversations
      conversation1 = await Conversation.create({
        participants: [testUser1._id, testUser2._id],
      });

      conversation2 = await Conversation.create({
        participants: [testUser1._id, testUser3._id],
      });
    });

    it("should find conversations by participant", async () => {
      const conversations = await Conversation.find({
        participants: testUser1._id,
      });

      expect(conversations).toHaveLength(2);
    });

    it("should find specific conversation between two users", async () => {
      const conversation = await Conversation.findOne({
        participants: { $all: [testUser1._id, testUser2._id] },
      });

      expect(conversation).toBeTruthy();
      expect(conversation._id.toString()).toBe(conversation1._id.toString());
    });

    it("should populate participants data", async () => {
      const conversation = await Conversation.findById(
        conversation1._id
      ).populate("participants", "username email");

      expect(conversation.participants).toHaveLength(2);
      expect(conversation.participants[0].username).toBeTruthy();
      expect(conversation.participants[1].username).toBeTruthy();
      expect(conversation.participants[0].password).toBeUndefined();
      expect(conversation.participants[1].password).toBeUndefined();
    });

    it("should populate lastMessage data", async () => {
      // Create a message for the conversation
      const message = await Message.create({
        conversationId: conversation1._id,
        sender: testUser1._id,
        recipient: testUser2._id,
        text: "Last message",
      });

      // Update conversation with last message
      conversation1.lastMessage = message._id;
      await conversation1.save();

      const populatedConversation = await Conversation.findById(
        conversation1._id
      ).populate("lastMessage");

      expect(populatedConversation.lastMessage).toBeTruthy();
      expect(populatedConversation.lastMessage.text).toBe("Last message");
    });

    it("should find conversations with last message populated", async () => {
      // Create messages for both conversations
      const message1 = await Message.create({
        conversationId: conversation1._id,
        sender: testUser1._id,
        recipient: testUser2._id,
        text: "Message 1",
      });

      const message2 = await Message.create({
        conversationId: conversation2._id,
        sender: testUser1._id,
        recipient: testUser3._id,
        text: "Message 2",
      });

      // Update conversations with last messages
      conversation1.lastMessage = message1._id;
      await conversation1.save();

      conversation2.lastMessage = message2._id;
      await conversation2.save();

      const conversations = await Conversation.find({
        participants: testUser1._id,
      })
        .populate("participants", "username email")
        .populate("lastMessage")
        .sort({ updatedAt: -1 });

      expect(conversations).toHaveLength(2);
      expect(conversations[0].lastMessage.text).toBeTruthy();
      expect(conversations[1].lastMessage.text).toBeTruthy();
    });
  });

  describe("Conversation Updates", () => {
    let conversation;

    beforeEach(async () => {
      conversation = await Conversation.create({
        participants: [testUser1._id, testUser2._id],
      });
    });

    it("should update lastMessage reference", async () => {
      const message = await Message.create({
        conversationId: conversation._id,
        sender: testUser1._id,
        recipient: testUser2._id,
        text: "New message",
      });

      const originalUpdatedAt = conversation.updatedAt;

      // Wait a bit to ensure timestamp difference
      await new Promise((resolve) => setTimeout(resolve, 10));

      conversation.lastMessage = message._id;
      await conversation.save();

      expect(conversation.lastMessage.toString()).toBe(message._id.toString());
      expect(conversation.updatedAt.getTime()).toBeGreaterThan(
        originalUpdatedAt.getTime()
      );
    });

    it("should not allow changing participants after creation", async () => {
      conversation.participants = [testUser2._id, testUser3._id];

      await expect(conversation.save()).rejects.toThrow();
    });
  });
});
