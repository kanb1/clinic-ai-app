// backend/src/controllers/patient/ai.controller.ts
import { Request, Response } from "express";
import { OpenAI } from "openai";
import dotenv from "dotenv";
dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const startChatSession = async (req: Request, res: Response) => {
  try {
    const { message } = req.body;

    if (!message) {
      res.status(400).json({ error: "Besked mangler" });
      return;
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: message }],
    });

    const reply = completion.choices[0].message.content;
    res.json({ reply });
  } catch (error) {
    console.error("OpenAI-fejl:", error);
    res.status(500).json({ error: "Noget gik galt med OpenAI." });
  }
};
