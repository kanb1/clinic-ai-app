import { JournalModel } from "../../../models/journal.model";
import { JournalEntryModel } from "../../../models/journalentry.model";
import { Request, Response } from "express";

// SEED ENTRIES ************
export const createTestJournalEntry = async (req: Request, res: Response) => {
  try {
    const { journalId, appointmentId, notes, created_by_ai } = req.body;

    if (!journalId || !appointmentId) {
      res
        .status(400)
        .json({ message: "journalId & appointmentId are neccessary" });
      return;
    }

    const newEntry = await JournalEntryModel.create({
      appointment_id: appointmentId,
      notes,
      created_by_ai,
    });

    await JournalModel.findByIdAndUpdate(journalId, {
      $push: { entries: newEntry._id },
    });

    res.status(201).json({ message: "JournalEntry created", entry: newEntry });
  } catch (error) {
    console.error("Error creating JournalEntry:", error);
    res.status(400).json({
      message: "An error occured. Try again later",
    });
    return;
  }
};
