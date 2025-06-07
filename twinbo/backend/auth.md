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
