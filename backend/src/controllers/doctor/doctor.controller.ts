import { Request, Response } from "express";
import { PrescriptionModel } from "../../models/prescription.model";
import { AppointmentModel } from "../../models/appointment.model";
import mongoose from "mongoose";
import { IUser, UserModel } from "../../models/user.model";
import { IPopulatedAppointment } from "../../interfaces/IPopulatedAppointment";
import { JournalModel } from "../../models/journal.model";
import { IPopulatedJournal } from "../../interfaces/IPopulatedJournal";
import { JournalEntryModel } from "../../models/journalentry.model";
import { TestResultModel } from "../../models/testresult.model";
import { ChatSessionModel } from "../../models/chatsession.model";

// Dashboard (overblik og status på ansatte)
export const getTodaysAppointments = async (req: Request, res: Response) => {
  try {
    const clinicId = req.user!.clinicId;
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const appointments = await AppointmentModel.find({
      clinic_id: new mongoose.Types.ObjectId(clinicId),
      date: { $gte: startOfDay, $lte: endOfDay },
      status: { $in: ["bekræftet", "aflyst"] },
    }).populate("patient_id", "name");

    res.status(200).json({ appointments });
  } catch (error) {
    console.error("Error fetching today's appointments:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// status på ansatte er i user-controlleren, da både sekretær og doctor bruger denne

// Kalender (oversigt over alle aftaler)
export const getAppointmentsForDoctor = async (req: Request, res: Response) => {
  try {
    const doctorId = req.user!._id;

    const appointments = await AppointmentModel.find({
      doctor_id: doctorId,
    })
      .populate("patient_id", "name")
      .sort({ date: 1, time: 1 });

    res.status(200).json(appointments);
  } catch (error) {
    console.error("Error fetching doctor's appointments:", error);
    res.status(500).json({ message: "Failed to fetch appointments", error });
  }
};

// Dagens aftaler (patientdetaljer og muligheder)
export const getTodayAppointmentDetails = async (
  req: Request,
  res: Response
) => {
  try {
    const clinicId = req.user!.clinicId;
    const { page = 1, limit = 6 } = req.query;

    // En slags filter for "dagens" aftaler
    const today = new Date();
    today.setHours(0, 0, 0, 0); // startdato = i dag kl. 00:00
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1); // slutdato = i morgen kl. 00:00

    // opbyg query (kun dagens aftaler for klinikken)
    const query = {
      clinic_id: clinicId,
      date: { $gte: today, $lt: tomorrow },
      status: "bekræftet", // kun bekræftede aftaler vises i tabel
    };

    // tæller hvor mange matcher i alt (bruges til frontend-pagination)
    const total = await AppointmentModel.countDocuments(query);

    // henter og paginerer data
    const appointments = await AppointmentModel.find(query)
      .populate("patient_id", "name birth_date") // henter patientens navn og fødselsdato
      .sort({ time: 1 }) // sorter fra morgen-eftermiddag (stigende)
      .skip((+page - 1) * +limit) // skip = hvor mange skal vi springe over (side 2 = spring 6 over, hvis limit=6)
      .limit(+limit); // hvor mange skal vi hente pr. side

    // resultatet er allerede formatteret så det er klar til visning i frontend-tabel
    const formatted = (appointments as unknown as IPopulatedAppointment[]).map(
      (appt) => {
        return {
          id: appt._id,
          patientId: appt.patient_id._id,
          patientName: appt.patient_id.name,
          birthDate: appt.patient_id.birth_date,
          time: appt.time,
          symptoms: appt.secretary_note || "Ingen sekretær-note angivet",
          journalAvailable: true,
          status: appt.status,
        };
      }
    );

    // sender både data + metadata om pagination
    res.status(200).json({
      data: formatted, // selve dataen
      total, // antal elementer i alt
      page: +page, // nuværende side
      totalPages: Math.ceil(total / +limit), // beregn antal sider
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Failed to fetch today’s appointments", error });
  }
};

export const cancelAppointmentByDoctor = async (
  req: Request,
  res: Response
) => {
  try {
    const appointmentId = req.params.id;
    const clinicId = req.user!.clinicId;

    // Tjekker om aftalen findes og tilhører samme klinik
    const appointment = await AppointmentModel.findOne({
      _id: appointmentId,
      clinic_id: clinicId,
    });

    if (!appointment) {
      res.status(404).json({ message: "Appointment not found" });
      return;
    }

    // Tjek om den allerede er aflyst
    if (appointment.status === "aflyst") {
      res.status(400).json({ message: "Appointment already cancelled" });
      return;
    }

    // Opdaterer status til aflyst
    appointment.status = "aflyst";
    await appointment.save();

    res.status(200).json({ message: "Appointment cancelled", appointment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error cancelling appointment", error });
  }
};

// Patientoversigt
export const getPatientsForDoctor = async (req: Request, res: Response) => {
  try {
    const clinicId = req.user!.clinicId;

    const patients = await UserModel.find({
      role: "patient",
      clinic_id: clinicId,
    }).select("name birth_date email phone status");

    res.status(200).json(patients);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch patients", error });
  }
};

export const getPatientDetails = async (req: Request, res: Response) => {
  try {
    const clinicId = req.user!.clinicId;
    const patientId = req.params.id;

    const patient = await UserModel.findOne({
      _id: patientId,
      role: "patient",
      clinic_id: clinicId,
    }).select("-password_hash");

    if (!patient) {
      res.status(404).json({ message: "Patient not found" });
      return;
    }

    res.status(200).json(patient);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch patient details", error });
  }
};

// Journaler

// henter alle journaler og kan ogse søge efter specifikke patienter
export const getJournalOverview = async (req: Request, res: Response) => {
  try {
    const clinicId = req.user!.clinicId;
    // vi henter søgeordet fra URL'en
    const search = req.query.search as string | undefined;

    // Henter alle journaler fra db (ingen filter endnu)
    // populate --> hente data om patienten via patient_id-referencen
    // hvis patienten matcher -> patient_id populated som objekt med navn og birth_date ellers null
    const journals = await JournalModel.find().populate({
      // find brugeren som journalen peger på (relation)
      path: "patient_id",
      // begrænser hvem vi henter ind i patient_id
      match: {
        clinic_id: clinicId, //kun samme klinik
        role: "patient",
        ...(search && {
          //hvis der søgeværdi, så kun:
          $or: [
            //or -> bruges til at matche på:
            // new RegExp(..): gør søgningen case-insensitive
            // rexexp bliver lavet når søgning sker
            { name: new RegExp(search, "i") },
            { email: new RegExp(search, "i") },
            { cpr_number: new RegExp(search, "i") },
          ],
          // hvis der ik er søgeværdi, så henter vi alle patienter i klinikken
        }),
      },
      select: "name birth_date", //henter kun disse for at gøre respons lettere og hurtigere
    });

    // journals er en liste med alle journaler vi fik fra journalmodel.find() - selvom match fejler - patientid bliver bare null, men populatematch fjerner ik hele journalen - så vi fjerner manuelt her med filter
    // j er et journal objekt i listen (normalt array)
    // j.patient_id tjekker om journalen har en gyldig patient
    const filtered = journals.filter((j) => j.patient_id);
    // ^vi får altså en ny liste kun med journaler som har en gyldig udfyldt patient efte rpopulate

    // Formatter vores data til en pæn frotnend venlig struktur
    const formatted = (filtered as unknown as IPopulatedJournal[]).map((j) => ({
      journalId: j._id,
      patientName: j.patient_id.name,
      birthDate: j.patient_id.birth_date,
      entryCount: j.entries.length,
    }));
    res.status(200).json(formatted);
  } catch (error) {
    console.error("Failed to get journal overview:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch journal overview", error });
  }
};

// Specifikke journal med patientens historik
export const getJournalById = async (req: Request, res: Response) => {
  try {
    const journalId = req.params.id;

    // flere lag af populate, for hver entry:
    const journal = await JournalModel.findById(journalId).populate({
      path: "entries",
      populate: {
        path: "appointment_id",
        select: "date time doctor_id",
        populate: {
          path: "doctor_id",
          select: "name role",
        },
      },
    });

    if (!journal) {
      res.status(404).json({ message: "Journal not found" });
      return;
    }

    // Formaterer entries til frotnend
    const formattedEntries = journal.entries.map((entry: any) => ({
      id: entry._id,
      notes: entry.notes,
      createdByAI: entry.created_by_ai,
      createdAt: entry.createdAt,
      appointmentDate: entry.appointment_id?.date,
      appointmentTime: entry.appointment_id?.time,
      doctorName: entry.appointment_id?.doctor_id?.name,
      doctorRole: entry.appointment_id?.doctor_id?.role,
    }));

    res.status(200).json({
      journalId: journal._id,
      patientId: journal.patient_id,
      entryCount: journal.entries.length,
      entries: formattedEntries,
    });
  } catch (error) {
    console.error("Failed to fetch journal", error);
    res.status(500).json({ message: "Failed to fetch journal", error });
  }
};

// SEED ENTRIES ************ SKAL SLETTES INDEN AFLEVERING ************
export const createTestJournalEntry = async (req: Request, res: Response) => {
  try {
    const { journalId, appointmentId, notes, created_by_ai } = req.body;

    if (!journalId || !appointmentId) {
      res
        .status(400)
        .json({ message: "journalId & appointmentId are neccessary" });
      return;
    }

    // Opretter selve JournalEntry-dokumentet
    const newEntry = await JournalEntryModel.create({
      appointment_id: appointmentId,
      notes,
      created_by_ai,
    });

    //Tilføjer reference til Journal
    await JournalModel.findByIdAndUpdate(journalId, {
      $push: { entries: newEntry._id },
    });

    res.status(201).json({ message: "JournalEntry created", entry: newEntry });
  } catch (error) {
    console.error("Error creating JournalEntry:", error);
    res.status(400).json({
      message: "Failed to create entry",
    });
    return;
  }
};

// Recept og Testresultater
export const createPrescription = async (req: Request, res: Response) => {
  try {
    const { patient_id, medication_name, dosage, instructions } = req.body;

    if (!patient_id || !medication_name || !dosage || !instructions) {
      res.status(400).json({
        message: "Alle felter skal udfyldes for at oprette en recepten",
      });
      return;
    }

    const newPrescription = new PrescriptionModel({
      patient_id,
      medication_name,
      dosage,
      instructions,
      issued_date: new Date(), // sætter dags dato automatisk
    });

    await newPrescription.save();

    res.status(201).json({
      message: "Recept oprettet",
      prescription: newPrescription,
    });
  } catch (error) {
    console.error("Fejl ved oprettelse af recept:", error);
    res.status(500).json({
      message: "Noget gik galt ved oprettelsen af recepten",
      error,
    });
  }
};

export const getPrescriptionsByPatient = async (
  req: Request,
  res: Response
) => {
  try {
    const { patientId } = req.params;

    const prescriptions = await PrescriptionModel.find({
      patient_id: patientId,
    }).sort({ issued_date: -1 }); // nyeste først

    res.status(200).json(prescriptions);
  } catch (error) {
    console.error("Failed to fetch prescriptions", error);
    res.status(500).json({ message: "Failed to fetch prescriptions", error });
  }
};

// SEED TESTRESULTS ************ SKAL SLETTES INDEN AFLEVERING ************
export const createTestResult = async (req: Request, res: Response) => {
  try {
    const { patient_id, test_name, result, date } = req.body;

    const newResult = new TestResultModel({
      patient_id,
      test_name,
      result,
      date,
    });

    await newResult.save();
    res.status(201).json({ message: "Testresultat oprettet", newResult });
  } catch (error) {
    console.error("Fejl ved oprettelse af testresultat", error);
    res.status(500).json({ message: "Fejl ved oprettelse", error });
  }
};

export const getTestResultsByPatient = async (req: Request, res: Response) => {
  try {
    const patientId = req.params.patientId;

    const results = await TestResultModel.find({ patient_id: patientId }).sort({
      date: -1,
    });

    res.status(200).json(results);
  } catch (error) {
    console.error("Fejl ved hentning af testresultater", error);
    res.status(500).json({ message: "Kunne ikke hente testresultater", error });
  }
};

// AI-noter og journal
// Hent gemt AI-chat for en specifik aftale
export const getChatSessionByAppointment = async (
  req: Request,
  res: Response
) => {
  try {
    const appointmentId = req.params.appointmentId;

    const chat = await ChatSessionModel.findOne({
      saved_to_appointment_id: appointmentId,
    })
      .select("messages patient_id createdAt")
      .populate("patient_id", "name");

    if (!chat) {
      res
        .status(404)
        .json({ message: "Ingen AI-chat fundet for denne aftale" });
      return;
    }

    res.status(200).json(chat);
  } catch (error) {
    console.error("Fejl ved hentning af gemt AI-chat:", error);
    res.status(500).json({ message: "Noget gik galt", error });
  }
};
