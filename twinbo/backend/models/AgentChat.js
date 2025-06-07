const mongoose = require("mongoose");

const AgentChatSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    threadId: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["user", "agent"],
      required: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
AgentChatSchema.index({ userId: 1, threadId: 1, createdAt: -1 });
AgentChatSchema.index({ threadId: 1 });

module.exports = mongoose.model("AgentChat", AgentChatSchema);
