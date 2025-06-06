# Node.js Authentication Backend

A complete Node.js backend with Express implementing JWT-based authentication.

## Features

- User Registration with password hashing
- User Login with JWT token generation
- Protected routes with JWT middleware
- MongoDB integration with Mongoose
- Error handling middleware
- CORS enabled

## Tech Stack

- Node.js
- Express.js
- MongoDB with Mongoose
- JWT (JSON Web Tokens)
- bcryptjs for password hashing

## Installation

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file with your environment variables (already included)

3. Start the server:

```bash
# Development mode
npm run dev

# Production mode
npm start
```

## API Endpoints

### Authentication Routes (`/api/auth`)

#### Register User

- **POST** `/api/auth/register`
- **Body:**

```json
{
  "username": "testuser",
  "email": "test@example.com",
  "password": "password123"
}
```

#### Login User

- **POST** `/api/auth/login`
- **Body:**

```json
{
  "email": "test@example.com",
  "password": "password123"
}
```

#### Logout User

- **POST** `/api/auth/logout`
- **Headers:** `Authorization: Bearer <your_jwt_token>`

#### Get User Profile

- **GET** `/api/auth/profile`
- **Headers:** `Authorization: Bearer <your_jwt_token>`

### Protected Routes

#### Home Route (Testing)

- **GET** `/api/home`
- **Headers:** `Authorization: Bearer <your_jwt_token>`
- Returns dummy data for testing authentication

## Project Structure

```
backend/
├── config/
│   └── database.js       # MongoDB connection
├── controllers/
│   └── authController.js # Authentication logic
├── middleware/
│   ├── auth.js          # JWT authentication middleware
│   └── errorHandler.js  # Error handling middleware
├── models/
│   └── User.js          # User model schema
├── routes/
│   ├── authRoutes.js    # Authentication routes
│   └── homeRoutes.js    # Protected test routes
├── .env                 # Environment variables
├── package.json
├── server.js           # Main server file
└── README.md
```

## Testing the API

You can test the API using tools like Postman, Thunder Client, or curl:

1. **Register a new user:**

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"password123"}'
```

2. **Login:**

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

3. **Access protected route:**

```bash
curl -X GET http://localhost:5000/api/home \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

## Environment Variables

- `PORT`: Server port (default: 5000)
- `MONGO_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT signing
- `JWT_EXPIRE`: JWT token expiration time (default: 7d)
