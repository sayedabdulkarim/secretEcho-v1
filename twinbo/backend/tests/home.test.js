const request = require("supertest");
const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const homeRoutes = require("../routes/homeRoutes");
const { authenticate } = require("../middleware/auth");

// Create Express app for testing
const app = express();
app.use(express.json());
app.use("/api/home", authenticate, homeRoutes);

describe("Home Routes", () => {
  let testUser;
  let validToken;

  beforeEach(async () => {
    // Create a test user
    testUser = await User.create({
      username: "testuser",
      email: "test@example.com",
      password: "password123",
    });

    // Generate a valid token
    validToken = jwt.sign({ userId: testUser._id }, process.env.JWT_SECRET);
  });

  describe("GET /api/home", () => {
    it("should return welcome message for authenticated user", async () => {
      const response = await request(app)
        .get("/api/home")
        .set("Authorization", `Bearer ${validToken}`)
        .expect(200);

      expect(response.body.status).toBe("success");
      expect(response.body.message).toBe(
        "Welcome to the protected home route!"
      );
      expect(response.body.data.user).toBe(testUser.username);
      expect(response.body.data.timestamp).toBeDefined();
      expect(response.body.data.message).toBe(
        "This is a dummy response for testing authentication"
      );
    });

    it("should require authentication", async () => {
      const response = await request(app).get("/api/home").expect(401);

      expect(response.body.status).toBe("error");
      expect(response.body.message).toContain("No token provided");
    });

    it("should reject invalid token", async () => {
      const response = await request(app)
        .get("/api/home")
        .set("Authorization", "Bearer invalid-token")
        .expect(401);

      expect(response.body.status).toBe("error");
      expect(response.body.message).toBe("Invalid token");
    });

    it("should have valid timestamp format", async () => {
      const response = await request(app)
        .get("/api/home")
        .set("Authorization", `Bearer ${validToken}`)
        .expect(200);

      const timestamp = response.body.data.timestamp;
      expect(timestamp).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/
      );

      // Verify it's a recent timestamp (within last 5 seconds)
      const timestampDate = new Date(timestamp);
      const now = new Date();
      const timeDiff = now - timestampDate;
      expect(timeDiff).toBeLessThan(5000);
    });
  });
});
