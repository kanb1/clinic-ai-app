import { Request, Response } from "express";
import { MessageModel } from "../../models/message.model";
import { IPopulatedMessage } from "../../interfaces/IPopulatedMessage";
import mongoose from "mongoose";
import { UserModel } from "../../models/user.model";

// **************************************************** BESKEDER
// HENT NYE BESKEDER
export const getUnreadMessages = async (req: Request, res: Response) => {
  try {
    //Henter clinicId fra den logged in user(sekretær)
    const clinicId = req.user!.clinicId;
    // Henter brugerens ID til at tjekke om besked er til denne bruger
    const userId = req.user!._id;

    // Finder alle ulæste beskeder (read: false)
    const messages = (await MessageModel.find({ read: false })
      // vigtigt med .populate, da sender- og receiver_id er objectID'er i mongo, så populate gør det til objekter med data -> Så vi kan få fat på brugerens data via den reference
      .populate("sender_id", "name role clinic_id")
      .populate(
        "recipient_id",
        "name role clinic_id"
      )) as unknown as IPopulatedMessage[]; //ts-workaround - populate.() gør objectID til brugerobjekter i runtime men det ved TS ikke, da den stadig ser som objectID
    //as unknown ← ignorer den type, TypeScript tror det er
    // as IPopulatedMessage[] ← brug i stedet denne type (vores interface)

    // filtrerer kun de beskeder, hvor modtageren (receiver_id) tilhører samme klinik som sekretæren der logget ind lige nu
    const filtered = messages.filter((msg) => {
      return (
        // Beskeden skal være fra samme klinik som den sekretæren tilhører (senderid er et objekt med clinicid pga populate)
        msg.sender_id.clinic_id === clinicId &&
        // besked er enten sendt til alle eller den er sendt direkte til den aktuelle sekretær
        (msg.receiver_id === null || msg.receiver_id._id === userId)
      );
    });

    res.status(200).json(filtered);
  } catch (error) {
    res.status(500).json({ message: "Failed to get unread messages", error });
  }
};

// SEND NY BESKED TIL PATIENT
export const sendMessage = async (req: Request, res: Response) => {
  try {
    const { receiver_id, content, type } = req.body;

    if (!receiver_id || !content || !type) {
      res.status(400).json({ message: "All fields are required" });
      return;
    }

    // Hvis receiver_id ikke er "all", skal det være en ObjectId
    if (
      receiver_id !== "all" &&
      !mongoose.Types.ObjectId.isValid(receiver_id)
    ) {
      res.status(400).json({ message: "Invalid receiver_id" });
      return;
    }

    const newMessage = await MessageModel.create({
      sender_id: req.user!._id, // sekretæren der er logget ind
      receiver_id,
      content,
      type,
    });

    res.status(201).json({ message: "Message sent", newMessage });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error sending message", error });
  }
};

export const markMessageAsReadBySecretary = async (
  req: Request,
  res: Response
) => {
  try {
    const messageId = req.params.id;

    const message = await MessageModel.findById(messageId);

    if (!message) {
      res.status(404).json({ message: "Message not found" });
      return;
    }

    // Hvis allerede læst
    if (message.read) {
      res.status(200).json({ message: "Message is already marked as read" });
      return;
    }

    message.read = true;
    await message.save();

    res.status(200).json({ message: "Message marked as read by secretary" });
  } catch (error) {
    res.status(500).json({ message: "Failed to mark message as read", error });
  }
};

// **************************************************** PATIENT OG LÆGEOPSÆTNING
export const getPatients = async (req: Request, res: Response) => {
  try {
    const clinicId = req.user!.clinicId;

    const patients = await UserModel.find({
      role: "patient",
      clinic_id: clinicId,
    });

    res.status(200).json(patients);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch patients", error });
  }
};

export const searchPatients = async (req: Request, res: Response) => {
  try {
    const clinicId = req.user!.clinicId;
    // tjekker om klienten har sendt en ?serach=.. i urlen - ellers bliver den bare undefined
    const searchQuery = req.query.search as string;

    // kriterier for denne her searchquery
    const query = {
      role: "patient",
      clinic_id: clinicId,
    };

    // Vi laver en RegEx søgning, så vi kan finde navne, e-mails eller CPR-numre - uanset stor/små bogstav men i string
    if (searchQuery) {
      // Laver et RegEx-mønster, som matcher fx "anna" hvor som helst i et felt (felt i db kan være alt og i vores tilfælde email, name og cpr)
      const regex = new RegExp(searchQuery, "i"); // case-insensitive søgning
      // Vi tilføjer en ekstra betingelse til vores query
      // or = (ekstra betingelse) Hvis nogen af felterne matcher, så vis resultatet.
      // Den søger altså i både navn, email og cpr samtidig som nedenfor vist
      // {
      //   role: "patient",
      //   clinic_id: "...",
      //   $or: [
      //     { name: /anna/i },
      //     { email: /anna/i },
      //     { cpr_number: /anna/i }
      //   ]
      // }
      Object.assign(query, {
        $or: [{ name: regex }, { email: regex }, { cpr_number: regex }],
      });
    }

    const patients = await UserModel.find(query);
    res.status(200).json(patients);
  } catch (error) {
    res.status(500).json({ message: "Failed to search patients", error });
  }
};
// **************************************************** Kalender og ledige tider
// **************************************************** Booking og notering
// **************************************************** Dashboard og historik
