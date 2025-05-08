import { Request, Response } from "express";
import { PrescriptionModel } from "../../models/prescription.model";
import { AppointmentModel } from "../../models/appointment.model";
import mongoose from "mongoose";
import { IUser } from "../../models/user.model";
import { IPopulatedAppointment } from "../../interfaces/IPopulatedAppointment";

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
      status: { $in: ["godkendt", "aflyst"] },
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

    // en slags filter for "dagens" aftaler
    const today = new Date();
    today.setHours(0, 0, 0, 0); // start-slut dato for i dag (00 fra i dag til i morgen 00)
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    // finder alle dagens aftale for klinikken
    const appointments = await AppointmentModel.find({
      clinic_id: clinicId,
      date: { $gte: today, $lt: tomorrow },
    })
      .populate("patient_id", "name birth_date")
      .sort({ time: 1 }); //sorter fra morgen-eftermiddag (stigende)

    // resultatet er allerede formatteret så det er kalr til visning i frotnend-tabel
    // map -> for hver aftale -> returner objekt med præcis de felter frontend har brug for
    // IPopulatedAppointment -> tvinger ts til at acceptere at patient_id indeholder name og birth_date -> ts tror det bare er et objectID
    const formatted = (appointments as unknown as IPopulatedAppointment[]).map(
      (appt) => {
        return {
          id: appt._id,
          patientName: appt.patient_id.name,
          birthDate: appt.patient_id.birth_date,
          time: appt.time,
          symptoms: appt.secretary_note || "–",
          journalAvailable: true, //ik færdig endnu
          status: appt.status,
        };
      }
    );

    res.status(200).json(formatted);
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

// Journaler

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

// AI-noter og journal
