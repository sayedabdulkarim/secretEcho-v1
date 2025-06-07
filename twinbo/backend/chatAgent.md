## 🤖 **Prompt: Add AI Agent Chat Endpoint with Memory and User Threads**

Now, extend the backend with an endpoint that allows users to interact with an AI chat agent (using OpenRouter and the existing `OPENROUTER_API_KEY`).

**Requirements:**

- There is a service file named `LLMService.js` (or `.ts`) for handling calls to the OpenRouter API.
- Review the `LLMService` file, clean it up, and remove any unused or unwanted code.
- Create a new endpoint:

  - `POST /ai-agent/message`
  - Accepts userId (from JWT), message text, and threadId (or auto-create if first message).
  - For every user, maintain a **separate conversation thread with the AI Agent** (i.e., store each user's chat history with the agent in its own collection/table).
  - Add "memory" to the agent—when user sends a new message, fetch the past messages in the thread and send as conversation context to OpenRouter, so the AI can reference previous chats.
  - Save all user/agent messages in the new "AgentChat" table/collection with fields: userId, threadId, role (`user` or `agent`), message, createdAt.
  - Return the agent’s response, and store it in the chat history.

- **Do not mix user-to-user and user-to-agent messages/tables.**
- Follow best practices for error handling, JWT auth, and code modularity.

To make update only for the backend.
