import { Request, Response } from "express";
import { MessageModel } from "../../models/message.model";

export const getUnreadMessagesForPatient = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = req.user!._id;

    const messages = await MessageModel.find({
      // beskeder der ik er læst
      read: false,
      // og en af følgende to betingelser skal være opfyldt:
      $or: [
        { receiver_id: userId }, // beskeden er sendt direkte til patienten
        { receiver_id: "all" }, // beskeden er en fællesbesked (broadcast)
      ],
    })
      .populate("sender_id", "name role clinic_id") //populate -> vi får ik bare objectId men populate gør det til objekter med selve brugerens data
      .sort({ createdAt: -1 }); //sorterer efter nyeste først -> faldende rækkefølge

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch unread messages", error });
  }
};
