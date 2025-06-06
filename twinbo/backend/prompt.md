Build a Node.js backend using Express that implements user authentication (registration, login, logout) with JWT tokens.

Requirements:

**Tech Stack:**

- Node.js
- Express
- MongoDB with Mongoose
- JWT for authentication
- bcrypt for password hashing

**Features:**

- **User Registration**

  - `POST /register`
  - Accepts username, email, and password.
  - Hash the password before saving.
  - Store user in MongoDB.

- **User Login**

  - `POST /login`
  - Accepts email and password.
  - Validate user and password.
  - On success, generate and return a JWT token.

- **User Logout**

  - `POST /logout`
  - Blacklist JWT token (in-memory array or MongoDB).
  - Secure all protected routes to reject blacklisted tokens.

- **JWT Middleware**

  - Middleware to verify JWT for protected routes.

- **Password Security**

  - Use bcrypt to hash and compare passwords.

- **Error Handling**

  - Use Express middleware for error handling.

- **Project Structure:**

  - Use separate folders/files for models (User), controllers (auth logic), routes (auth routes), middleware (JWT, errors).

- Use middleware for error handling and logging

////

Bilkul! Ab ek **prompt for chat features** bana dete hain, jo directly baad mein Copilot ya GPT ko de sakte ho for quick generation.
Auth logic already done, ab sirf **chat/conversation/message logic + Socket.IO** chahiye.

---

## 💬 **Chat Features Backend Prompt (Node.js + Express + MongoDB + Socket.IO)**

> Extend the backend built in Node.js (Express) with MongoDB (Mongoose) and JWT authentication to support real-time one-to-one chat functionality.
>
> **Requirements:**
>
> **Tech Stack:**
>
> - Node.js
> - Express
> - MongoDB + Mongoose
> - Socket.IO for real-time chat
>
> **Assume authentication (JWT) is already set up and available as middleware.**
>
> **Features:**
>
> - **Users** can send direct (one-to-one) messages to other users.
>
> - **Data Models:**
>
>   - User (existing)
>   - Conversation:
>
>     - `participants: [userId, userId]` (array of 2 user IDs)
>     - `lastMessage` (optional for quick chat list)
>     - `timestamps`
>
>   - Message:
>
>     - `conversationId`
>     - `sender` (userId)
>     - `recipient` (userId)
>     - `text`
>     - `createdAt`
>
> - **APIs:**
>
>   - `GET /users` – List all users except current (for chat selection)
>   - `GET /conversations` – List all conversations for logged-in user (with last message & participant info)
>   - `GET /messages/:conversationId` – Fetch all messages in a conversation
>   - `POST /messages` – Send message (body: recipientId, text)
>
>     - If conversation doesn’t exist, create one
>     - Save message, update conversation's lastMessage
>
> - **Socket.IO Real-time Logic:**
>
>   - On client connect, authenticate via JWT and join a room with their userId
>   - When user sends a message:
>
>     - Save to DB (Message + Conversation)
>     - Emit message to recipient's room in real time if online
>
>   - Notify sender and recipient both (for instant chat UI)
>
> - **Error handling:** Use Express middleware for catching errors.
>
> - **Modular code:**
>
>   - Separate folders for models (Conversation, Message), controllers (chat/message logic), routes (chat/message routes), middleware, and socket logic.
>
> **Do not include auth code, assume it is already in place. Only focus on chat, conversation, and message features.**

---

**Want ready-to-use Mongoose schemas or folder structure for this?**
Just ask, bhai—detailing bhi karwa dunga!
