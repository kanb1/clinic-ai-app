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

// Dashboard (overblik over appointments for i dag - aflyst/bekræftet)
export const getTodaysAppointments = async (req: Request, res: Response) => {
  try {
    const clinicId = req.user!.clinicId;
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0); //start på dagen, 00:00:00
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999); //slut på dagen

    const appointments = await AppointmentModel.find({
      clinic_id: new mongoose.Types.ObjectId(clinicId),
      // datoer mellem start og slutning af dag
      // greater than/equal to - less than/equal to
      date: { $gte: startOfDay, $lte: endOfDay },
      // feltet skal have en af værdierne i denne liste
      status: { $in: ["bekræftet", "aflyst"] },
    }).populate("patient_id", "name"); //hent også navn på patienten i UserModel som patient_id ref til

    res.status(200).json({ appointments });
  } catch (error) {
    console.error("Error fetching today's appointments:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Aftaler i dag (oversigt over alle aftaler) - Bruges ik rigtig nogle steder
export const getAppointmentsForDoctor = async (req: Request, res: Response) => {
  try {
    const doctorId = req.user!._id;

    // Finder alle aftaler -> doctor_id matcher den aktuelle læges ID
    const appointments = await AppointmentModel.find({
      doctor_id: doctorId,
    })
      .populate("patient_id", "name")
      .sort({ date: 1, time: 1 });

    res.status(200).json(appointments);
  } catch (error) {
    console.error("Error fetching doctor's appointments:", error);
    res.status(500).json({ message: "Could not get ressources" });
  }
};

// Dagens aftaler (patientdetaljer og muligheder) - Pagination
export const getTodayAppointmentDetails = async (
  req: Request,
  res: Response
) => {
  try {
    const clinicId = req.user!.clinicId;
    // henter pagination parametre fra URL'en (?page=2&limit=6)
    const { page = 1, limit = 6 } = req.query;

    // En slags filter for "dagens" aftaler
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    // opbyg query (kun dagens aftaler for klinikken)
    const query = {
      clinic_id: clinicId,
      date: { $gte: today, $lt: tomorrow },
      status: "bekræftet", // kun bekræftede aftaler vises i tabel
    };

    // tæller hvor mange matcher i alt (bruges til frontend-pagination)
    // fx "side 1 af 4"
    const total = await AppointmentModel.countDocuments(query);

    // henter og paginerer data
    const appointments = await AppointmentModel.find(query)
      .populate("patient_id", "name birth_date")
      //stigende -> ældste først
      .sort({ time: 1 })
      // springer over et antal resultater afhængig af hvilkens ide vi er på i pagination
      // + foran -> konvert til tal -> startes som number fra req.query
      // page = 1, limit 6: (1-1) * 6 = skip(0) (de første 6)
      // page = 2, limit 6: (2-1) * 6 = skip(6) (skip første 6) -> får resultater 7-12
      .skip((+page - 1) * +limit)
      // hvor mange skal vi hente pr. side (6)
      .limit(+limit);

    // resultatet er allerede formatteret så det er klar til visning i frontend-tabel
    // ts ved ikke hvad type .populate returnerer -> klager
    // as unknown -> glem hvad du tror det er -> det er en: as IPopulatedAppointment
    const formatted = (appointments as unknown as IPopulatedAppointment[]).map(
      // mapper aftalerne
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

    res.status(200).json({
      data: formatted, //selve aftalerne
      total, //samlet antal
      page: +page, //aktuel side
      // beregn antal sider der skal bruges i pagination
      // Math.ceil() -> Rund op til nærmeste heltal -> sikrer at sidste side også vises
      // math.ceil(17/6) = 3 -> Side 1: 1-6, 2: 7-12, 3: resten
      totalPages: Math.ceil(total / +limit),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not get ressources" });
  }
};

// Aflys aftale
export const cancelAppointmentByDoctor = async (
  req: Request,
  res: Response
) => {
  try {
    const appointmentId = req.params.id;
    const clinicId = req.user!.clinicId;

    const appointment = await AppointmentModel.findOne({
      _id: appointmentId,
      clinic_id: clinicId,
    });

    if (!appointment) {
      res.status(404).json({ message: "Could not find appointm,net" });
      return;
    }

    // Tjek om den allerede er aflyst
    if (appointment.status === "aflyst") {
      res.status(400).json({ message: "Appointment is already cancelled" });
      return;
    }

    // Opdaterer status til aflyst
    appointment.status = "aflyst";
    await appointment.save();

    res
      .status(200)
      .json({ message: "Appointment is successfully cancelled", appointment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "An error happened. Try again later.." });
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

// Patientdetaljer
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
    res.status(500).json({ message: "Could not get ressources" });
  }
};

// Journaler

// BRUGES IKKE I FRONTEND ALLIGEVEL
export const getJournalOverview = async (req: Request, res: Response) => {
  try {
    const clinicId = req.user!.clinicId;
    // vi henter søgeordet fra URL'en
    // hvis ?search=Anders -> gemmer search="Anders" -> ellers undefined
    const search = req.query.search as string | undefined;

    const journals = await JournalModel.find().populate({
      // find brugeren som journalen peger på (relation)
      path: "patient_id",
      // begrænser hvilke patienter vi vil populate
      match: {
        clinic_id: clinicId, //fra aktuelle klinik
        role: "patient",
        ...(search && {
          //hvis der søgeværdi, så tilføj dette filter:
          $or: [
            //or -> mindst én af disse 3 felter skal matche:
            // new RegExp(..): gør search-værdi case-insensitive
            { name: new RegExp(search, "i") },
            { email: new RegExp(search, "i") },
            { cpr_number: new RegExp(search, "i") },
          ],
          // hvis der ik er søgeværdi, så henter vi alle patienter i klinikken
        }),
      },
      select: "name birth_date", //henter kun disse for at gøre respons lettere og hurtigere
    });

    // Undgå at sende journaler uden gyldige patienter (renser data efter populate.match har filtreret nogle væk)
    // journals -> array af journal-dokuments fra ^
    // hver journal -> patinet_id -> vi har populated med match-betingelserne
    // behold kun de journaler, hvor patient_id IKKE er null
    // hvis patient_id fra anden klinik/populated/null
    const filtered = journals.filter((j) => j.patient_id);

    const formatted = (filtered as unknown as IPopulatedJournal[]).map((j) => ({
      journalId: j._id,
      patientName: j.patient_id.name,
      birthDate: j.patient_id.birth_date,
      entryCount: j.entries.length,
    }));
    res.status(200).json(formatted);
  } catch (error) {
    console.error("Failed to get journal overview:", error);
    res.status(500).json({ message: "Could not get ressources" });
  }
};

// Specifik journal med patientens historik
export const getJournalById = async (req: Request, res: Response) => {
  try {
    // henter journalid fra URL'en
    const journalId = req.params.id;

    // henter journalen via findById
    // flere lag af populate, for hver entry:
    const journal = await JournalModel.findById(journalId).populate({
      // alle journalentries -> array af journalentrymodel
      path: "entries",
      // hver entry i journalen bliver udvidet med:
      populate: {
        // tilknyttet aftale til hver entry
        path: "appointment_id",
        // dato og tid for aftalen
        select: "date time doctor_id",
        // læge tilknyttet aftalen
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
      // hvis entry er koblet til aftale -> hent dato og tid
      appointmentDate: entry.appointment_id?.date,
      appointmentTime: entry.appointment_id?.time,
      doctorName: entry.appointment_id?.doctor_id?.name,
      doctorRole: entry.appointment_id?.doctor_id?.role,
    }));

    // sender journal tiblage til fronte med:
    res.status(200).json({
      journalId: journal._id, //id på journal
      patientId: journal.patient_id, //patientens ID
      entryCount: journal.entries.length, //antal entries
      entries: formattedEntries, //formattedEntries listen
    });
  } catch (error) {
    console.error("Failed to fetch journal", error);
    res.status(500).json({ message: "Could not get the ressource" });
  }
};

// Recept og Testresultater
export const createPrescription = async (req: Request, res: Response) => {
  try {
    const { patient_id, medication_name, dosage, instructions } = req.body;

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
      message: "Noget gik galt.. prøv igen senere",
    });
  }
};

// Get prescriptions pr patient
export const getPrescriptionsByPatient = async (
  req: Request,
  res: Response
) => {
  try {
    const { patientId } = req.params;

    const prescriptions = await PrescriptionModel.find({
      patient_id: patientId,
    }).sort({ issued_date: -1 }); //nyeste først

    res.status(200).json(prescriptions);
  } catch (error) {
    console.error("Failed to fetch prescriptions", error);
    res.status(500).json({ message: "Could not get ressources" });
  }
};

export const getTestResultsByPatient = async (req: Request, res: Response) => {
  try {
    const patientId = req.params.patientId;

    const results = await TestResultModel.find({ patient_id: patientId }).sort({
      date: -1, //nyeste først - faldende
    });

    res.status(200).json(results);
  } catch (error) {
    console.error("Fejl ved hentning af testresultater", error);
    res.status(500).json({ message: "Could not get ressources" });
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
      .select("summary_for_doctor messages patient_id createdAt")
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
    res.status(500).json({ message: "Noget gik galt" });
  }
};
