// LLM Service using OpenRouter API
const axios = require("axios");
require("dotenv").config();

class LLMServiceError extends Error {
  constructor(message) {
    super(message);
    this.name = "LLMServiceError";
  }
}

class LLMService {
  constructor() {
    this.apiKey = process.env.OPENROUTER_API_KEY;
    if (!this.apiKey) {
      throw new LLMServiceError(
        "OPENROUTER_API_KEY environment variable not set"
      );
    }
  }

  // Generate chat response with conversation context
  async generateChatResponse(messages, maxTokens = 1000) {
    // Validate input
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      throw new LLMServiceError("Messages array cannot be empty");
    }

    const maxRetries = 3;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const response = await axios.post(
          "https://openrouter.ai/api/v1/chat/completions",
          {
            model: "openai/gpt-4o",
            messages: messages,
            max_tokens: maxTokens,
            temperature: 0.7,
          },
          {
            headers: {
              Authorization: `Bearer ${this.apiKey}`,
              "Content-Type": "application/json",
            },
            timeout: 60000, // 60 seconds
          }
        );

        if (
          !response.data ||
          !response.data.choices ||
          !response.data.choices[0]
        ) {
          throw new LLMServiceError(
            "Invalid response format from OpenRouter API"
          );
        }

        // Return both content and usage information for consistency with tests
        return {
          content: response.data.choices[0].message.content,
          usage: response.data.usage || {
            prompt_tokens: 0,
            completion_tokens: 0,
            total_tokens: 0,
          },
        };
      } catch (error) {
        console.error(`Error on attempt ${attempt + 1}:`, error.message);

        // Handle rate limiting specifically
        if (error.response && error.response.status === 429) {
          throw new LLMServiceError(
            "Rate limit exceeded. Please try again later."
          );
        }

        if (attempt < maxRetries - 1) {
          const waitTime =
            process.env.NODE_ENV === "test" ? 10 : (attempt + 1) * 5000; // Shorter wait time for tests
          console.warn(`Retrying in ${waitTime / 1000}s...`);
          await new Promise((resolve) => setTimeout(resolve, waitTime));
          continue;
        }

        // After all retries failed
        throw new LLMServiceError(
          `Failed to generate response after ${maxRetries} attempts`
        );
      }
    }
  }
}

module.exports = { LLMService, LLMServiceError };
