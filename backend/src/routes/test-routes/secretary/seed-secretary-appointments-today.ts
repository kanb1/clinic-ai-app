import { Request, Response } from "express";
import mongoose from "mongoose";
import { AppointmentModel } from "../../../models/appointment.model";
import { AvailabilitySlotModel } from "../../../models/availabilityslots.model";
import { UserModel } from "../../../models/user.model";

export const seedAppointmentsToday = async (req: Request, res: Response) => {
  try {
    const clinicId = req.user!.clinicId;

    const doctorId = new mongoose.Types.ObjectId("6831c8fdd9a1db06f75fe297");

    const patient = await UserModel.findOne({
      role: "patient",
      clinic_id: clinicId,
    });

    if (!patient) {
      res.status(400).json({ message: "Ingen patient fundet" });
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const slots = [
      {
        doctor_id: doctorId,
        clinic_id: clinicId,
        date: today,
        start_time: "08:00",
        end_time: "08:30",
        is_booked: true,
      },
      {
        doctor_id: doctorId,
        clinic_id: clinicId,
        date: today,
        start_time: "08:30",
        end_time: "09:00",
        is_booked: true,
      },
      {
        doctor_id: doctorId,
        clinic_id: clinicId,
        date: today,
        start_time: "09:00",
        end_time: "09:30",
        is_booked: true,
      },
      {
        doctor_id: doctorId,
        clinic_id: clinicId,
        date: today,
        start_time: "09:30",
        end_time: "10:00",
        is_booked: true,
      },
      {
        doctor_id: doctorId,
        clinic_id: clinicId,
        date: today,
        start_time: "10:00",
        end_time: "10:30",
        is_booked: true,
      },
      {
        doctor_id: doctorId,
        clinic_id: clinicId,
        date: today,
        start_time: "10:30",
        end_time: "11:00",
        is_booked: true,
      },
      {
        doctor_id: doctorId,
        clinic_id: clinicId,
        date: today,
        start_time: "11:00",
        end_time: "11:30",
        is_booked: true,
      },
      {
        doctor_id: doctorId,
        clinic_id: clinicId,
        date: today,
        start_time: "11:30",
        end_time: "12:00",
        is_booked: true,
      },
      {
        doctor_id: doctorId,
        clinic_id: clinicId,
        date: today,
        start_time: "12:00",
        end_time: "12:30",
        is_booked: true,
      },
      {
        doctor_id: doctorId,
        clinic_id: clinicId,
        date: today,
        start_time: "12:30",
        end_time: "13:00",
        is_booked: true,
      },
    ];

    const createdSlots = await AvailabilitySlotModel.insertMany(slots);

    const appointments = await Promise.all(
      createdSlots.map((slot) =>
        AppointmentModel.create({
          patient_id: patient._id,
          doctor_id: doctorId,
          clinic_id: clinicId,
          date: slot.date,
          time: slot.start_time,
          end_time: slot.end_time,
          status: "bekræftet",
        })
      )
    );

    res
      .status(201)
      .json({ message: "Seeded today's appointments", appointments });
  } catch (error) {
    console.error("Fejl ved seeding:", error);
    res.status(500).json({ message: "Fejl under seeding", error });
  }
};
