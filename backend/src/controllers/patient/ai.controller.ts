import { Request, Response } from "express";
import { OpenAI } from "openai";
import dotenv from "dotenv";
import { ChatSessionModel } from "../../models/chatsession.model";
dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Start chat session
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

// Save chat session
export const saveChatHistory = async (req: Request, res: Response) => {
  try {
    const patientId = req.user!._id;
    const { messages, appointmentId } = req.body;

    if (!messages || !Array.isArray(messages)) {
      res.status(400).json({ message: "Ugyldig samtalehistorik" });
      return;
    }

    const newChat = await ChatSessionModel.create({
      patient_id: patientId,
      messages,
      saved_to_appointment_id: appointmentId,
    });

    res.status(201).json({ message: "Samtale gemt", chat: newChat });
  } catch (error) {
    console.error("Fejl ved gem af chat:", error);
    res.status(500).json({ message: "Noget gik galt", error });
  }
};
