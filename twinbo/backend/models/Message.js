const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000, // Limit message length
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
MessageSchema.index({ conversationId: 1, createdAt: -1 });
MessageSchema.index({ sender: 1 });
MessageSchema.index({ recipient: 1 });

module.exports = mongoose.model("Message", MessageSchema);
