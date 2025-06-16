import { Request, Response } from "express";
import { OpenAI } from "openai";
import dotenv from "dotenv";
import { ChatSessionModel } from "../../models/chatsession.model";
dotenv.config();

// opretter kun en openaI-klient hvis denne her funktion kaldes, for at undgå den er global
export const getOpenAIClient = () => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("Missing OpenAI API key");
  // returner en ny openai-klient -> når funktion kaldes
  return new OpenAI({ apiKey });
};

// Start chat session
export const startChatSession = async (req: Request, res: Response) => {
  try {
    const openai = getOpenAIClient();
    const { message } = req.body;

    // creating a system-prompt
    // empathic, clinic-frienly
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      // messages array
      messages: [
        {
          role: "system", //deffinerer AI'ens persona
          // empatisk og clinic-venlig
          content: `
            Du er en venlig og empatisk klinik-assistent, der hjælper patienter med at sætte ord på deres symptomer før en konsultation. Din hensigt er at forbedre kvaliteten af konsultationen mellem læge og patienten og få patienten til at føle sig mere forberedt.
            Du stiller uddybende spørgsmål og forsøger at berolige patienten, hvis de virker bekymrede.
            Du må ikke stille diagnoser eller give lægefaglige råd – det skal en læge gøre. Men du må gerne hjælpe patienten med at forberede sig til mødet med en sundhedsprofessionel.
          `,
        },
        {
          role: "user", //definerer user
          content: message, //indsætter brugerens besked i samtalen
        },
      ],
    });
    // ^danner kontekstuel samtale -> gpt svarer i rollen du har defineret

    //completion.choices[0]: OpenAI kan returnere flere forslag, men vi tager det første.
    const reply = completion.choices[0].message.content;
    // bliver AI's svar og sendes til frontend som JSON
    res.json({ reply });
  } catch (error) {
    console.error("OpenAI-fejl:", error);
    res.status(429).json({
      message: "For mange beskeder på kort tid. Nulstiller om 10 min.",
    });
    res.status(500).json({ error: "Noget gik desværre galt" });
  }
};

// Save chat session
export const saveChatHistory = async (req: Request, res: Response) => {
  try {
    const patientId = req.user!._id;
    const { messages, appointmentId } = req.body;
    const openai = getOpenAIClient();

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

    // formater beskeder til én lang tekst til gpt
    const formattedMessages = messages
      // for hver besked-par (bruger-ai) -> kombiner brugerens input med AI'ens svar
      .map((m: { user: string; ai: string }) => `${m.user}\n${m.ai}`)
      .join("\n\n");

    // laver resume af samlen -> laver prompt til gpt
    const summaryPrompt = `
      Du er en klinikassistent, der skal lave et kort overblik til en læge baseret på følgende samtale med en patient:

      ${formattedMessages}

      Lav en opsummering til lægen: hvad beskriver patienten, hvilke symptomer nævnes, og hvor længe har det stået på? Brug 3-5 sætninger. 
      Undlad at skrive "Patienten siger..." bare gå direkte til sagen.
      `;

    // Kalder OpenAI med prompten
    // sætter systemrolle som "medicinst klinik assistent"

    const summaryResponse = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "Du er en medicinsk klinikassistent." },
        { role: "user", content: summaryPrompt },
      ],
    });

    // resultatet hentes fra "choices[0].message.content"
    //summaryResponse.choices[0]: OpenAI kan returnere flere forslag, men vi tager det første.
    const summary = summaryResponse.choices[0].message.content;

    // opretter nyt doc i chatessionmodel
    const newChat = await ChatSessionModel.create({
      patient_id: patientId,
      messages,
      saved_to_appointment_id: appointmentId,
      summary_for_doctor: summary,
    });

    res.status(201).json({ message: "Samtale gemt", chat: newChat });
  } catch (error) {
    console.error("Fejl ved gem af chat:", error);
    res.status(500).json({ message: "Noget gik galt" });
  }
};
