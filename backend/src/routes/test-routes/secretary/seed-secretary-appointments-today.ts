import { Request, Response } from "express";
import mongoose from "mongoose";
import { AppointmentModel } from "../../../models/appointment.model";
import { AvailabilitySlotModel } from "../../../models/availabilityslots.model";
import { UserModel } from "../../../models/user.model";

export const seedAppointmentsToday = async (req: Request, res: Response) => {
  try {
    const clinicId = req.user!.clinicId;
    const doctorId = new mongoose.Types.ObjectId("681766d7417431c949707908");

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
        date: today,
        start_time: "09:00",
        end_time: "09:30",
        is_booked: true,
      },
      {
        doctor_id: doctorId,
        date: today,
        start_time: "10:00",
        end_time: "10:30",
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
