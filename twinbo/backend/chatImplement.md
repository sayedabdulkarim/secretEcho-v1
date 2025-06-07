## 💬 **Chat Features Backend Prompt (Node.js + Express + MongoDB + Socket.IO)**

Extend the backend built in Node.js (Express) with MongoDB (Mongoose) and JWT authentication to support real-time one-to-one chat functionality.

**Requirements:**

**Tech Stack:**

- Node.js
- Express
- MongoDB + Mongoose
- Socket.IO for real-time chat

- **Users** can send direct (one-to-one) messages to other users.

- **Data Models:**

  - User (existing)

  - Conversation:

    - `participants: [userId, userId]` (array of 2 user IDs)
    - `lastMessage` (optional for quick chat list)
    - `timestamps`

  - Message:

    - `conversationId`
    - `sender` (userId)
    - `recipient` (userId)
    - `text`
    - `createdAt`

- **APIs:**

  - `GET /users` – List all users except current (for chat selection)
  - `GET /conversations` – List all conversations for logged-in user (with last message & participant info)
  - `GET /messages/:conversationId` – Fetch all messages in a conversation
  - `POST /messages` – Send message (body: recipientId, text)

    - If conversation doesn’t exist, create one
    - Save message, update conversation's lastMessage

- **Socket.IO Real-time Logic:**

  - On client connect, authenticate via JWT and join a room with their userId
  - When user sends a message:

    - Save to DB (Message + Conversation)
    - Emit message to recipient's room in real time if online

  - Notify sender and recipient both (for instant chat UI)

- **Error handling:** Use Express middleware for catching errors.

- **Modular code:**

  - Separate folders for models (Conversation, Message), controllers (chat/message logic), routes (chat/message routes), middleware, and socket logic.

**Do not include auth code, assume it is already in place. Only focus on chat, conversation, and message features.**
