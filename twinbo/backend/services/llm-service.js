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

        return response.data.choices[0].message.content;
      } catch (error) {
        console.error(`Error on attempt ${attempt + 1}:`, error.message);

        if (attempt < maxRetries - 1) {
          const waitTime = (attempt + 1) * 5000; // Progressive retry delay in ms
          console.warn(`Retrying in ${waitTime / 1000}s...`);
          await new Promise((resolve) => setTimeout(resolve, waitTime));
          continue;
        }

        throw new LLMServiceError(`Error generating response: ${error.message}`);
      }
    }
  }
}

module.exports = { LLMService, LLMServiceError };
