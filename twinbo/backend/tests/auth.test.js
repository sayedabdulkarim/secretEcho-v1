const request = require("supertest");
const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const authRoutes = require("../routes/authRoutes");
const { errorHandler, notFound } = require("../middleware/errorHandler");

// Create Express app for testing
const app = express();
app.use(express.json());
app.use("/api/auth", authRoutes);
// Add error handling middleware
app.use(notFound);
app.use(errorHandler);

describe("Auth Controller", () => {
  let testUser;
  let validToken;

  beforeEach(async () => {
    // Create a test user for login tests
    testUser = await User.create({
      username: "testuser",
      email: "test@example.com",
      password: "password123",
    });

    // Generate a valid token for protected route tests
    validToken = jwt.sign({ userId: testUser._id }, process.env.JWT_SECRET);
  });

  describe("POST /api/auth/register", () => {
    it("should register a new user successfully", async () => {
      const userData = {
        username: "newuser",
        email: "newuser@example.com",
        password: "password123",
      };

      const response = await request(app)
        .post("/api/auth/register")
        .send(userData)
        .expect(201);

      expect(response.body.status).toBe("success");
      expect(response.body.message).toBe("User registered successfully");
      expect(response.body.data.user.username).toBe(userData.username);
      expect(response.body.data.user.email).toBe(userData.email);
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.user.password).toBeUndefined();
    });

    it("should not register a user with existing email", async () => {
      const userData = {
        username: "anotheruser",
        email: "test@example.com", // Same as testUser
        password: "password123",
      };

      const response = await request(app)
        .post("/api/auth/register")
        .send(userData)
        .expect(400);

      expect(response.body.status).toBe("error");
      expect(response.body.message).toContain("already exists");
    });

    it("should not register a user with existing username", async () => {
      const userData = {
        username: "testuser", // Same as testUser
        email: "different@example.com",
        password: "password123",
      };

      const response = await request(app)
        .post("/api/auth/register")
        .send(userData)
        .expect(400);

      expect(response.body.status).toBe("error");
      expect(response.body.message).toContain("already exists");
    });

    it("should validate required fields", async () => {
      const response = await request(app)
        .post("/api/auth/register")
        .send({
          username: "testuser2",
          // Missing email and password
        })
        .expect(400); // MongoDB validation error results in 400

      // Check validation error response
      expect(response.body.status).toBe("error");
      expect(response.body.message).toBe("Validation Error");
    });
  });

  describe("POST /api/auth/login", () => {
    it("should login with valid credentials", async () => {
      const loginData = {
        email: "test@example.com",
        password: "password123",
      };

      const response = await request(app)
        .post("/api/auth/login")
        .send(loginData)
        .expect(200);

      expect(response.body.status).toBe("success");
      expect(response.body.message).toBe("Login successful");
      expect(response.body.data.user.username).toBe(testUser.username);
      expect(response.body.data.user.email).toBe(testUser.email);
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.user.password).toBeUndefined();
    });

    it("should not login with invalid email", async () => {
      const loginData = {
        email: "wrong@example.com",
        password: "password123",
      };

      const response = await request(app)
        .post("/api/auth/login")
        .send(loginData)
        .expect(401); // Controller returns 401 for invalid credentials

      expect(response.body.status).toBe("error");
      expect(response.body.message).toBe("Invalid credentials");
    });

    it("should not login with invalid password", async () => {
      const loginData = {
        email: "test@example.com",
        password: "wrongpassword",
      };

      const response = await request(app)
        .post("/api/auth/login")
        .send(loginData)
        .expect(401); // Controller returns 401 for invalid credentials

      expect(response.body.status).toBe("error");
      expect(response.body.message).toBe("Invalid credentials");
    });

    it("should validate required fields", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: "test@example.com",
          // Missing password
        })
        .expect(500); // MongoDB/server error for missing fields

      expect(response.body.message).toContain("validation failed");
    });
  });

  describe("GET /api/auth/profile", () => {
    it("should get user profile with valid token", async () => {
      const response = await request(app)
        .get("/api/auth/profile")
        .set("Authorization", `Bearer ${validToken}`)
        .expect(200);

      expect(response.body.status).toBe("success");
      expect(response.body.data.user.username).toBe(testUser.username);
      expect(response.body.data.user.email).toBe(testUser.email);
      expect(response.body.data.user.password).toBeUndefined();
    });

    it("should not get profile without token", async () => {
      const response = await request(app).get("/api/auth/profile").expect(401);

      expect(response.body.status).toBe("error");
      expect(response.body.message).toContain("No token provided");
    });

    it("should not get profile with invalid token", async () => {
      const response = await request(app)
        .get("/api/auth/profile")
        .set("Authorization", "Bearer invalid-token")
        .expect(401);

      expect(response.body.status).toBe("error");
      expect(response.body.message).toBe("Invalid token");
    });
  });

  describe("POST /api/auth/logout", () => {
    it("should logout successfully with valid token", async () => {
      const response = await request(app)
        .post("/api/auth/logout")
        .set("Authorization", `Bearer ${validToken}`)
        .expect(200);

      expect(response.body.status).toBe("success");
      expect(response.body.message).toBe(
        "Logout successful. Please remove the token from client storage."
      );
    });

    it("should not logout without token", async () => {
      const response = await request(app).post("/api/auth/logout").expect(401);

      expect(response.body.status).toBe("error");
      expect(response.body.message).toContain("No token provided");
    });
  });
});
