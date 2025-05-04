import { Request, Response } from "express";
import { MessageModel } from "../../models/message.model";
import { IPopulatedMessage } from "../../interfaces/IPopulatedMessage";

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
