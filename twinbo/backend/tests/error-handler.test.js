const { errorHandler, notFound } = require("../middleware/errorHandler");

// Mock response and next functions
const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const mockNext = jest.fn();

describe("Error Handler Middleware", () => {
  beforeEach(() => {
    mockNext.mockClear();
    // Mock console.error to avoid noise in tests
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    console.error.mockRestore();
  });

  describe("errorHandler", () => {
    it("should handle Mongoose validation errors", () => {
      const validationError = {
        name: "ValidationError",
        errors: {
          email: { message: "Email is required" },
          password: { message: "Password must be at least 6 characters" },
        },
      };

      const req = {};
      const res = mockResponse();

      errorHandler(validationError, req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        status: "error",
        message: "Validation Error",
        errors: ["Email is required", "Password must be at least 6 characters"],
      });
    });

    it("should handle Mongoose duplicate key errors", () => {
      const duplicateError = {
        code: 11000,
        keyValue: { email: "test@example.com" },
      };

      const req = {};
      const res = mockResponse();

      errorHandler(duplicateError, req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        status: "error",
        message: "email already exists",
      });
    });

    it("should handle JWT errors", () => {
      const jwtError = {
        name: "JsonWebTokenError",
        message: "invalid token",
      };

      const req = {};
      const res = mockResponse();

      errorHandler(jwtError, req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        status: "error",
        message: "Invalid token",
      });
    });

    it("should handle custom errors with status codes", () => {
      const customError = {
        statusCode: 403,
        message: "Access denied",
      };

      const req = {};
      const res = mockResponse();

      errorHandler(customError, req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        status: "error",
        message: "Access denied",
      });
    });

    it("should handle generic errors with default 500 status", () => {
      const genericError = {
        message: "Something went wrong",
      };

      const req = {};
      const res = mockResponse();

      errorHandler(genericError, req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        status: "error",
        message: "Something went wrong",
      });
    });

    it("should handle errors without message", () => {
      const errorWithoutMessage = {};

      const req = {};
      const res = mockResponse();

      errorHandler(errorWithoutMessage, req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        status: "error",
        message: "Internal Server Error",
      });
    });

    it("should log errors to console", () => {
      const error = { message: "Test error" };
      const req = {};
      const res = mockResponse();

      errorHandler(error, req, res, mockNext);

      expect(console.error).toHaveBeenCalledWith("Error:", error);
    });
  });

  describe("notFound", () => {
    it("should return 404 for not found routes", () => {
      const req = {
        originalUrl: "/api/nonexistent",
      };
      const res = mockResponse();

      notFound(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        status: "error",
        message: "Route /api/nonexistent not found",
      });
    });

    it("should handle requests without originalUrl", () => {
      const req = {};
      const res = mockResponse();

      notFound(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        status: "error",
        message: "Route undefined not found",
      });
    });
  });
});
