const mongoose = require("mongoose");

const ConversationSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
  },
  {
    timestamps: true,
  }
);

// Ensure participants array has exactly 2 users and they are unique
ConversationSchema.pre("save", function (next) {
  if (this.participants.length !== 2) {
    return next(new Error("Conversation must have exactly 2 participants"));
  }

  // Check if participants are unique
  const [participant1, participant2] = this.participants;
  if (participant1.toString() === participant2.toString()) {
    return next(new Error("Participants must be different users"));
  }

  // Prevent changing participants after creation
  if (!this.isNew && this.isModified("participants")) {
    return next(
      new Error("Cannot modify participants after conversation creation")
    );
  }

  next();
});

// Index for efficient queries
ConversationSchema.index({ participants: 1 });

module.exports = mongoose.model("Conversation", ConversationSchema);
