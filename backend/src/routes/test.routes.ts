import express from "express";
import mongoose from "mongoose";
import { UserModel } from "../models/user.model";
import { MessageModel } from "../models/message.model";
import { AppointmentModel } from "../models/appointment.model";
import { ClinicModel } from "../models/clinic.model";
import { AvailabilitySlotModel } from "../models/availabilityslots.model";

const router = express.Router();

router.post("/seed-secretary-flow", async (req, res) => {
  try {
    // Ryd testdata (kun til testmiljø!)
    await UserModel.deleteMany({});
    await ClinicModel.deleteMany({});
    await MessageModel.deleteMany({});
    await AppointmentModel.deleteMany({});
    await AvailabilitySlotModel.deleteMany({});

    // Opret admin (kræves for at oprette klinik)
    const admin = await UserModel.create({
      name: "Admin Bruger",
      email: "admin@test.dk",
      password_hash: "1234",
      role: "admin",
      clinic_id: new mongoose.Types.ObjectId(), // midlertidig
    });

    //  Opret klinik med admin som creator
    const clinic = await ClinicModel.create({
      name: "Testklinik",
      address: "Testvej 1",
      created_by: admin._id,
    });

    // Opdater admin med korrekt klinik_id
    admin.clinic_id = clinic._id as mongoose.Types.ObjectId;
    await admin.save();

    //  Opret sekretær
    const secretary = await UserModel.create({
      name: "Sofie Sekretær",
      email: "sek@test.dk",
      password_hash: "1234",
      role: "secretary",
      clinic_id: clinic._id,
    });

    // Opret læge
    const doctor = await UserModel.create({
      name: "Simon Eisbo",
      email: "doc@test.dk",
      password_hash: "1234",
      role: "doctor",
      clinic_id: clinic._id,
    });

    // Opret patient
    const patient = await UserModel.create({
      name: "Kanza Bokhari",
      email: "kanza@test.dk",
      password_hash: "1234",
      role: "patient",
      clinic_id: clinic._id,
      cpr_number: "1234567890",
      birth_date: new Date("1999-01-01"),
    });

    // Opret besked fra læge til sekretær
    await MessageModel.create({
      sender_id: doctor._id,
      receiver_id: secretary._id,
      content: "Husk at tjekke laboratorieresultater.",
      type: "besked",
      read: false,
    });

    // Opret en aftale i dag
    const today = new Date();
    today.setHours(10, 30, 0, 0);

    await AppointmentModel.create({
      doctor_id: doctor._id,
      patient_id: patient._id,
      clinic_id: clinic._id,
      date: today,
      time: "10:30",
      status: "venter",
    });

    // Opret ledige tider (3 dage frem)
    const slots = [];
    for (let i = 0; i < 3; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      slots.push(
        {
          doctor_id: doctor._id,
          date,
          start_time: "09:00",
          end_time: "09:30",
          is_booked: false,
        },
        {
          doctor_id: doctor._id,
          date,
          start_time: "10:00",
          end_time: "10:30",
          is_booked: false,
        }
      );
    }

    await AvailabilitySlotModel.insertMany(slots);

    res.status(201).json({
      message: "Secretary flow seeded!",
      clinic,
      users: {
        admin,
        secretary,
        doctor,
        patient,
      },
    });
  } catch (error) {
    console.error("Seeding error:", error);
    res.status(500).json({ message: "Fejl under seeding", error });
  }
});

export default router;
