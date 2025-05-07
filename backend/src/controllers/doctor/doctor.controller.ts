import { Request, Response } from "express";
import { PrescriptionModel } from "../../models/prescription.model";
import { AppointmentModel } from "../../models/appointment.model";
import mongoose from "mongoose";

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
