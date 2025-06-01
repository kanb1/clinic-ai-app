import { Request, Response } from "express";
import { JournalModel } from "../../models/journal.model";
import { JournalEntryModel } from "../../models/journalentry.model";

// ***************** Gets or creates a journal by patientId
// Har allerede patienter i min løsning - borgerservice-systemet der laver patienterne
// Vil altid gerne sikre der findes en journal for en patient når jeg åbner journalsiden for en patient
export const getOrCreateJournalByPatientId = async (
  req: Request,
  res: Response
) => {
  try {
    const patientId = req.params.patientId;

    let journal = await JournalModel.findOne({ patient_id: patientId });

    if (!journal) {
      journal = await JournalModel.create({ patient_id: patientId });
    }

    res.status(200).json({
      journalId: journal._id,
      patientId: journal.patient_id,
      entryCount: journal.entries.length,
    });
  } catch (error) {
    console.error("Fejl ved oprettelse eller hentning af journal:", error);
    res.status(500).json({ message: "Serverfejl", error });
  }
};

// ***************** Creates journalentry (note til en appointment i journalen)
export const createJournalEntry = async (req: Request, res: Response) => {
  try {
    const { journalId, appointmentId, notes } = req.body;

    if (!journalId || !appointmentId || !notes) {
      res
        .status(400)
        .json({ message: "journalId, appointmentId og notes er påkrævet" });
      return;
    }

    // Opret journal entry
    const newEntry = await JournalEntryModel.create({
      appointment_id: appointmentId,
      notes,
      created_by_ai: false,
    });

    // Tilføj entry til journal
    await JournalModel.findByIdAndUpdate(journalId, {
      $push: { entries: newEntry._id },
    });

    res.status(201).json({ message: "Journalnotat gemt", entry: newEntry });
    return;
  } catch (error) {
    console.error("Fejl ved oprettelse af journalnotat:", error);
    res.status(500).json({ message: "Serverfejl", error });
    return;
  }
};
