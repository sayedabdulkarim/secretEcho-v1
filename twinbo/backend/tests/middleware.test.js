const jwt = require("jsonwebtoken");
const { authenticate } = require("../middleware/auth");
const User = require("../models/User");

// Mock response object
const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

// Mock next function
const mockNext = jest.fn();

describe("Auth Middleware", () => {
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

    // Clear mock calls
    mockNext.mockClear();
  });

  describe("authenticate middleware", () => {
    it("should authenticate user with valid token", async () => {
      const req = {
        header: jest.fn().mockReturnValue(`Bearer ${validToken}`),
      };
      const res = mockResponse();

      await authenticate(req, res, mockNext);

      expect(req.user).toBeDefined();
      expect(req.user._id.toString()).toBe(testUser._id.toString());
      expect(req.user.username).toBe(testUser.username);
      expect(req.user.email).toBe(testUser.email);
      expect(req.user.password).toBeUndefined();
      expect(mockNext).toHaveBeenCalledWith();
      expect(res.status).not.toHaveBeenCalled();
    });

    it("should reject request without authorization header", async () => {
      const req = {
        header: jest.fn().mockReturnValue(null),
      };
      const res = mockResponse();

      await authenticate(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        status: "error",
        message: "No token provided or invalid format",
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should reject request with invalid token format", async () => {
      const req = {
        header: jest.fn().mockReturnValue("InvalidFormat token"),
      };
      const res = mockResponse();

      await authenticate(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        status: "error",
        message: "No token provided or invalid format",
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should reject request with invalid token", async () => {
      const req = {
        header: jest.fn().mockReturnValue("Bearer invalid-token"),
      };
      const res = mockResponse();

      await authenticate(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        status: "error",
        message: "Invalid token",
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should reject request with token for non-existent user", async () => {
      // Delete the test user
      await User.findByIdAndDelete(testUser._id);

      const req = {
        header: jest.fn().mockReturnValue(`Bearer ${validToken}`),
      };
      const res = mockResponse();

      await authenticate(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        status: "error",
        message: "Token is valid but user not found",
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should handle server errors gracefully", async () => {
      // Mock jwt.verify to throw an unexpected error (not token-related)
      const originalVerify = jwt.verify;
      jwt.verify = jest.fn().mockImplementation(() => {
        throw new Error("Unexpected server error");
      });

      const req = {
        header: jest.fn().mockReturnValue(`Bearer ${validToken}`),
      };
      const res = mockResponse();

      await authenticate(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        status: "error",
        message: "Invalid token",
      });
      expect(mockNext).not.toHaveBeenCalled();

      // Restore original method
      jwt.verify = originalVerify;
    });
  });
});
