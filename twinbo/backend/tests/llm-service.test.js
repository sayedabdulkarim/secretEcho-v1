const axios = require("axios");
const { LLMService, LLMServiceError } = require("../services/llm-service");

// Mock axios
jest.mock("axios");
const mockedAxios = axios;

describe("LLMService", () => {
  let llmService;

  beforeAll(() => {
    // Set environment variable for testing
    process.env.OPENROUTER_API_KEY = "test-api-key";
  });

  beforeEach(() => {
    llmService = new LLMService();
    // Clear all axios mocks and reset implementations
    jest.clearAllMocks();
  });

  afterAll(() => {
    delete process.env.OPENROUTER_API_KEY;
  });

  describe("Constructor", () => {
    it("should initialize with API key from environment", () => {
      expect(llmService.apiKey).toBe("test-api-key");
    });

    it("should throw error if API key is not provided", () => {
      delete process.env.OPENROUTER_API_KEY;

      expect(() => {
        new LLMService();
      }).toThrow("OPENROUTER_API_KEY environment variable not set");

      // Restore for other tests
      process.env.OPENROUTER_API_KEY = "test-api-key";
    });
  });

  describe("generateChatResponse", () => {
    const mockMessages = [{ role: "user", content: "Hello, how are you?" }];

    const mockApiResponse = {
      data: {
        choices: [
          {
            message: {
              content: "Hello! I am doing well, thank you for asking.",
            },
          },
        ],
        usage: {
          prompt_tokens: 10,
          completion_tokens: 15,
          total_tokens: 25,
        },
      },
    };

    it("should generate chat response successfully", async () => {
      mockedAxios.post.mockResolvedValueOnce(mockApiResponse);

      const result = await llmService.generateChatResponse(mockMessages);

      expect(result).toEqual({
        content: "Hello! I am doing well, thank you for asking.",
        usage: {
          prompt_tokens: 10,
          completion_tokens: 15,
          total_tokens: 25,
        },
      });

      expect(mockedAxios.post).toHaveBeenCalledWith(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          model: "openai/gpt-4o",
          messages: mockMessages,
          max_tokens: 1000,
          temperature: 0.7,
        },
        {
          headers: {
            Authorization: "Bearer test-api-key",
            "Content-Type": "application/json",
          },
          timeout: 60000,
        }
      );
    });

    it("should use custom max tokens when provided", async () => {
      mockedAxios.post.mockResolvedValueOnce(mockApiResponse);

      await llmService.generateChatResponse(mockMessages, 500);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          max_tokens: 500,
        }),
        expect.any(Object)
      );
    });

    it("should handle API errors with retry logic", async () => {
      const errorResponse = {
        response: {
          status: 500,
          data: { error: "Internal server error" },
        },
      };

      // Mock first two calls to fail, third to succeed
      mockedAxios.post
        .mockRejectedValueOnce(errorResponse)
        .mockRejectedValueOnce(errorResponse)
        .mockResolvedValueOnce(mockApiResponse);

      const result = await llmService.generateChatResponse(mockMessages);

      expect(result.content).toBe(
        "Hello! I am doing well, thank you for asking."
      );
      expect(mockedAxios.post).toHaveBeenCalledTimes(3);
    });

    it("should throw error after max retries", async () => {
      const errorResponse = {
        response: {
          status: 500,
          data: { error: "Internal server error" },
        },
      };

      // Mock all calls to fail
      mockedAxios.post.mockRejectedValue(errorResponse);

      await expect(
        llmService.generateChatResponse(mockMessages)
      ).rejects.toThrow("Failed to generate response after 3 attempts");

      expect(mockedAxios.post).toHaveBeenCalledTimes(3);
    });

    it("should handle rate limit errors specifically", async () => {
      const rateLimitError = {
        response: {
          status: 429,
          data: { error: "Rate limit exceeded" },
        },
      };

      mockedAxios.post.mockRejectedValueOnce(rateLimitError);

      await expect(
        llmService.generateChatResponse(mockMessages)
      ).rejects.toThrow("Rate limit exceeded. Please try again later.");
    });

    it("should handle network errors", async () => {
      const networkError = new Error("Network Error");
      networkError.code = "ECONNREFUSED";

      mockedAxios.post.mockRejectedValue(networkError);

      await expect(
        llmService.generateChatResponse(mockMessages)
      ).rejects.toThrow("Failed to generate response after 3 attempts");
    });
  });

  describe("Error Handling", () => {
    it("should handle invalid response format", async () => {
      const invalidResponse = {
        data: {
          // Missing choices array
          usage: {
            total_tokens: 10,
          },
        },
      };

      mockedAxios.post.mockResolvedValueOnce(invalidResponse);

      await expect(
        llmService.generateChatResponse([{ role: "user", content: "test" }])
      ).rejects.toThrow();
    });

    it("should handle empty messages array", async () => {
      await expect(llmService.generateChatResponse([])).rejects.toThrow();
    });
  });
});
