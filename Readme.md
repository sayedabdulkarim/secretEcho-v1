# Twinbo Chat Application

A real-time chat application with AI agent integration built with React, Node.js, Socket.IO, and MongoDB.

## Project Setup

### Prerequisites

- Node.js (v16+)
- MongoDB
- npm or yarn

### Installation

1. **Clone and navigate to project**

   ```bash
   cd assignment
   ```

2. **Backend Setup**

   ```bash
   cd twinbo/backend
   npm install
   cp .env.example .env  # Configure your environment variables
   npm start
   ```

3. **Frontend Setup**
   ```bash
   cd twinbo/frontend
   npm install
   npm start
   ```

### Environment Variables

Create `.env` in backend directory:

```
PORT=5001
MONGODB_URI=mongodb://localhost:27017/twinbo
JWT_SECRET=your_jwt_secret
OPENAI_API_KEY=your_openai_key  # For AI agent
```

## Architecture Overview

### Backend (Node.js + Express)

- **Authentication**: JWT-based auth with middleware protection
- **Real-time Communication**: Socket.IO for live messaging and user status
- **Database**: MongoDB with Mongoose ODM
- **API Structure**:
  - `/api/auth` - User registration/login
  - `/api/chat` - User-to-user messaging
  - `/api/ai-agent` - AI chat functionality

### Frontend (React + TypeScript)

- **State Management**: Redux Toolkit with RTK Query
- **UI Framework**: Tailwind CSS
- **Real-time**: Socket.IO client integration
- **Key Components**:
  - `ChatArea` - Main messaging interface
  - `ChatSidebar` - User list and conversations
  - `AiChatAgentModal` - AI assistant interface

### Key Features

- **Real-time Messaging**: Instant message delivery with Socket.IO
- **User Status**: Online/offline indicators
- **AI Integration**: Built-in AI chat assistant
- **Responsive Design**: Mobile-friendly interface
- **Authentication**: Secure JWT-based login system

### Data Models

- **User**: Authentication and profile data
- **Conversation**: Chat sessions between users
- **Message**: Individual chat messages
- **AgentChat**: AI conversation history

## API Endpoints

### Authentication

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Chat

- `GET /api/chat/users` - Get all users
- `GET /api/chat/conversations` - Get user conversations
- `GET /api/chat/messages/:id` - Get conversation messages
- `POST /api/chat/messages` - Send message

### AI Agent

- `POST /api/ai-agent/message` - Send message to AI
- `GET /api/ai-agent/history` - Get AI chat history

## Socket Events

- `newMessage` - Real-time message delivery
- `userOnline`/`userOffline` - User status updates
- `typing` - Typing indicators

## Getting Started

1. Start MongoDB service
2. Run backend server (`npm start` in backend/)
3. Run frontend development server (`npm start` in frontend/)
4. Navigate to `http://localhost:3000`
5. Register/login and start chatting!
