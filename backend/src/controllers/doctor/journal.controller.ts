import { Request, Response } from "express";
import { JournalModel } from "../../models/journal.model";
import {
  IJournalEntry,
  JournalEntryModel,
} from "../../models/journalentry.model";
import { AppointmentModel } from "../../models/appointment.model";
import { IUser, UserModel } from "../../models/user.model";

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

    const patient = await UserModel.findById(patientId).select("name");

    res.status(200).json({
      journalId: journal._id,
      patientId: journal.patient_id,
      patientName: patient?.name || "Ukendt",
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

// ***************** Creates journalentry (note til en appointment i journalen)
// Henter alle appointments for den patient
export const getAppointmentsWithJournalForPatient = async (
  req: Request,
  res: Response
) => {
  try {
    const patientId = req.params.patientId;

    const appointments = await AppointmentModel.find({ patient_id: patientId })
      .populate("doctor_id", "name")
      .sort({ date: -1 });

    const populatedJournal = await JournalModel.findOne({
      patient_id: patientId,
    }).populate("entries");

    // Map journalEntries til deres appointment_id
    const entriesByAppointment: Record<string, IJournalEntry> = {};
    if (populatedJournal) {
      for (const entry of populatedJournal.entries as unknown as IJournalEntry[]) {
        const key = entry.appointment_id.toString();
        entriesByAppointment[key] = entry;
      }
    }

    const formatted = appointments.map((appt) => {
      const appointmentId = String(appt._id);
      const doctor = appt.doctor_id as unknown as IUser;

      return {
        _id: appointmentId,
        date: appt.date.toISOString(),
        time: appt.time,
        doctorName:
          typeof doctor === "object" && "name" in doctor
            ? doctor.name
            : "Ukendt",
        status: appt.status,
        secretaryNote: appt.secretary_note || null,
        journalEntry: entriesByAppointment[appointmentId] || null,
      };
    });

    res.status(200).json(formatted);
  } catch (error) {
    console.error("Fejl ved hentning af aftaler + journal:", error);
    res.status(500).json({
      message: "Serverfejl",
      error,
    });
  }
};
