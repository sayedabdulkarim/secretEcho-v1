## 🖥️ **Frontend Chat UI Prompt (React + Redux Toolkit + Socket.IO)**

Extend the frontend app (React + Redux Toolkit) to implement a one-to-one real-time chat UI using Socket.IO, after login (auth already in place).

**Requirements:**

- **Stack:**

  - React (functional components, hooks)
  - Redux Toolkit (for API and state management)
  - Socket.IO client (for real-time events)
  - React Router v6 (routing already in place)

- **Main Layout:**

  - On successful login, navigate to `/`.
  - move nav from HomePage.tsx to a separate component for header .
  - add a dark mode , and by dfeualt it should be in dark mode.
  - `/` route should show a two-column layout (sidebar + chat area) in 20:80 ratio:

    - **Left Sidebar (20% width):**

      - Fetch and display all users except the current user.
      - For each user, show:

        - Username
        - Green dot indicator if user is online (using Socket.IO events)
        - Clickable to select/start chat

      - Show current user's info at the top.

    - **Right Chat Area (80% width):**

      - When a user is selected from sidebar:

        - Fetch the conversation and messages with that user (from backend)
        - Display messages in a scrollable chat box (sender/receiver bubbles)
        - At the bottom, input field + send button to send new message
        - Show real-time messages using Socket.IO (instant UI update)
        - If the user is online, show "online" status in header of chat area

- **Online Presence Logic:**

  - Use Socket.IO to:

    - Emit event on user connect/disconnect
    - Listen for presence events and update UI to show/hide green dot

- **Redux Toolkit:**

  - Use slices and async thunks for:

    - Fetching users list
    - Fetching conversations/messages
    - Sending new message (via both API and Socket.IO)
    - Storing online user list in Redux state for dot status

- **Responsive Design:**

  - Layout should work well on desktop, and sidebar should be collapsible or bottom-tab on mobile.

- **Do not include registration/login logic.**

  - Assume user is authenticated and JWT is handled.

- **APIs available:**

  - `GET /users`
  - `GET /conversations`
  - `GET /messages/:conversationId`
  - `POST /messages`

- **Socket.IO:**

  - Connect on entering `/`, authenticate via JWT, and join room with userId.
  - Handle incoming/outgoing messages and presence updates.

- **Bonus:**

  - Show "typing..." indicator when other user is typing (Socket.IO event).
  -

we have to update only Frontend.
