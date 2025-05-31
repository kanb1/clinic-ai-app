import { Request, Response } from "express";
import { OpenAI } from "openai";
import dotenv from "dotenv";
import { ChatSessionModel } from "../../models/chatsession.model";
dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Du er en venlig og empatisk klinik-assistent, der hjælper patienter med at sætte ord på deres symptomer før en konsultation. Din hensigt er at forbedre kvaliteten af konsultationen mellem læge og patienten og få patienten til at føle sig mere forberedt.
//Du stiller uddybende spørgsmål og forsøger at berolige patienten, hvis de virker bekymrede.
//Du må ikke stille diagnoser eller give lægefaglige råd – det skal en læge gøre. Men du må gerne hjælpe patienten med at forberede sig til mødet med en sundhedsprofessionel.

// Start chat session
export const startChatSession = async (req: Request, res: Response) => {
  try {
    const { message } = req.body;

    if (!message) {
      res.status(400).json({ error: "Besked mangler" });
      return;
    }

    // creating a system-prompt
    // empathic, clinic-frienly
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `
            Du er en venlig og empatisk klinik-assistent, der hjælper patienter med at sætte ord på deres symptomer før en konsultation. Din hensigt er at forbedre kvaliteten af konsultationen mellem læge og patienten og få patienten til at føle sig mere forberedt.
            Du stiller uddybende spørgsmål og forsøger at berolige patienten, hvis de virker bekymrede.
            Du må ikke stille diagnoser eller give lægefaglige råd – det skal en læge gøre. Men du må gerne hjælpe patienten med at forberede sig til mødet med en sundhedsprofessionel.
          `,
        },
        {
          role: "user",
          content: message,
        },
      ],
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

    // Tjekker om der allerede findes en chatsession for den appointment - må max have 1 pr appoint.
    const existing = await ChatSessionModel.findOne({
      patient_id: patientId,
      saved_to_appointment_id: appointmentId,
    });

    if (existing) {
      res.status(400).json({
        message: "Der findes allerede en gemt chat for denne aftale.",
      });
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
