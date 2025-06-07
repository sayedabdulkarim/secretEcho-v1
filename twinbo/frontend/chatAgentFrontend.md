## 🤖 **Frontend Prompt: AI Chat Agent Modal (React + Redux Toolkit)**

Extend the frontend app (React + Redux Toolkit) to add an AI Chat Agent feature:

**Requirements:**

- In the main layout, add a fixed icon labeled “AI Chat Agent” at the bottom of the sidebar.
- On clicking the icon:

  - Open a modal dialog that overlays the page, showing a chat thread UI.
  - Modal should have a cross (X) icon in the top-right corner to close it.

- When the modal opens:

  - Call the protected backend API `GET /api/ai-agent/history` to fetch and display the current user’s AI agent chat history.
  - Show user and agent messages as chat bubbles (distinct styles for each).

- At the bottom of the modal:

  - Input field and send button for sending messages to the AI agent.
  - On submit, call the protected backend API `POST /api/ai-agent/message` with the prompt.
  - Show a loading indicator while waiting for a response.
  - On success, append both user’s prompt and agent’s reply to the chat thread in the modal UI.

- Use Redux Toolkit for state management (chat thread, loading, error).
- APIs:

  - `GET /api/ai-agent/history` (fetch history)
  - `POST /api/ai-agent/message` (send user prompt, receive agent reply)

- Modal should be fully responsive and accessible.
- Do not mix this UI or logic with user-to-user chat—keep AI agent modal state separate.
