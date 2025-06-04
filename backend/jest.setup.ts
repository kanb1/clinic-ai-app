/// <reference types="jest" />

import dotenv from "dotenv";
import path from "path";

// Load .env.test
dotenv.config({ path: path.resolve(__dirname, ".env.test") });
console.log("JWT_SECRET i setup:", process.env.JWT_SECRET);

// Mock OpenAI
jest.mock("openai", () => ({
  OpenAI: jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: jest.fn().mockResolvedValue({
          choices: [{ message: { content: "Mocked response" } }],
        }),
      },
    },
  })),
}));
