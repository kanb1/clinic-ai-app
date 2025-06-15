/// <reference types="jest" />

// global jest.setup -> mocker openai og loader .env.test

import dotenv from "dotenv";
import path from "path";

// Load .env.test
dotenv.config({ path: path.resolve(__dirname, ".env.test") });

// Mock OpenAI, for at undgå credit-use under test
// mock hele openai modul når den bliver importet i testfil
jest.mock("openai", () => ({
  // jest.fn() -> fake constructor funktion
  // når new OpenAI() kaldes (OpenAI:) -> returner objekt defineret i mockImplementation
  OpenAI: jest.fn().mockImplementation(() => ({
    // object matcher struktur i min controller
    // const completetion = await openai.chat.compleretions.create...
    chat: {
      completions: {
        // mockresolvedvalue -> svar til async funktioner
        create: jest.fn().mockResolvedValue({
          // giver altid fake svar -> præcis hvad min controller forventer
          choices: [{ message: { content: "Mocked response" } }],
        }),
      },
    },
  })),
}));
