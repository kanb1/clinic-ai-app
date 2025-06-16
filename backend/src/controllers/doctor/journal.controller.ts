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
    // patienten fra url -> vælger en patient at gå ud fra i listen
    const patientId = req.params.patientId;

    // prøver finde journalen
    // let -> journal overskrevet hvis den ik findes -> den skal oprettes
    let journal = await JournalModel.findOne({ patient_id: patientId });

    // opretter journalen
    if (!journal) {
      journal = await JournalModel.create({ patient_id: patientId });
    }

    //  patientens navn -> i responsen
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
    // journal, appo. det drejer sig om, selve teksten
    const { journalId, appointmentId, notes } = req.body;

    // Opret journal entry
    const newEntry = await JournalEntryModel.create({
      appointment_id: appointmentId,
      notes,
      created_by_ai: false, //kun AI-noter får true
    });

    // Tilføj newEntry til journal
    // journalId -> id på den journalid vi arbejder med
    await JournalModel.findByIdAndUpdate(journalId, {
      //$push for at tilføje ID’et til entries arrayen i journalen
      // id referer til den specifikke entry (specifikke notat i entrymodel)
      // entries --> array af ID’er (i JournalModel) til JournalEntryModel docs (selve journalnotaterne)
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

// Henter alle appointments for den patient
export const getAppointmentsWithJournalForPatient = async (
  req: Request,
  res: Response
) => {
  try {
    // henter patienten fra: /journals/appointments-with-journal/:patientId
    const patientId = req.params.patientId;

    // hent alle aftaler for givne patient
    const appointments = await AppointmentModel.find({ patient_id: patientId })
      .populate("doctor_id", "name")
      .sort({ date: -1 });

    // hent journalen for patienten og populate dens entries (notaterne)
    const populatedJournal = await JournalModel.findOne({
      patient_id: patientId,
    }).populate("entries");

    // Map journalEntries til deres appointment_id
    // Opretter tomt "slå op-objekt"
    const entriesByAppointment: Record<string, IJournalEntry> = {};
    // hvis journalen eksisterer:
    if (populatedJournal) {
      // mapper hvor nøglen er appointment_id, værdien er journalnotatet.
      // looper over alle notater (journal entries):
      for (const entry of populatedJournal.entries as unknown as IJournalEntry[]) {
        // konverter appointment_id til srtring og brug det som nøgle
        const key = entry.appointment_id.toString();
        // entriesByAppointment["5563avcd"] giver adgang til tilhørende notatet
        entriesByAppointment[key] = entry;
      }
    }

    const formatted = appointments.map((appt) => {
      // appointmentid bliver til string fordi det objectid
      const appointmentId = String(appt._id);
      // caster til IUser da popluate() returner noget løst typed..
      const doctor = appt.doctor_id as unknown as IUser;

      // hvad frontend har brug for
      return {
        _id: appointmentId,
        date: appt.date.toISOString(), //dato som string
        time: appt.time,
        doctorName:
          typeof doctor === "object" && "name" in doctor
            ? doctor.name
            : "Ukendt",
        status: appt.status, // status på app.
        secretaryNote: appt.secretary_note || null,
        journalEntry: entriesByAppointment[appointmentId] || null, //journalentry via entriesByAppoitnment
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
