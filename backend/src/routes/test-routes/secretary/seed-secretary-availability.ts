import { Request, Response } from "express";
import { AvailabilitySlotModel } from "../../../models/availabilityslots.model";
import { UserModel } from "../../../models/user.model";

// Utility: genererer klokkeslæt mellem 08:00 og 17:00 i 30 minutters intervaller
const generateTimeSlots = () => {
  const times: { start: string; end: string }[] = [];
  for (let h = 8; h < 17; h++) {
    times.push({
      start: `${h.toString().padStart(2, "0")}:00`,
      end: `${h.toString().padStart(2, "0")}:30`,
    });
  }
  return times.slice(0, 10); // max 10 pr dag
};

export const seedAvailabilitySlots = async (req: Request, res: Response) => {
  try {
    const clinicId = req.user!.clinicId;

    // SLET gamle availability slots for denne klinik
    await AvailabilitySlotModel.deleteMany({ clinic_id: clinicId });

    // Find alle læger i klinikken
    const doctors = await UserModel.find({
      clinic_id: clinicId,
      role: "doctor",
    });

    if (!doctors.length) {
      res.status(404).json({ message: "No doctors found" });
      return;
    }

    const daysToSeed = 21;
    const slotsToInsert = [];

    const now = new Date();
    now.setHours(0, 0, 0, 0);

    for (let i = 0; i < daysToSeed; i++) {
      const currentDate = new Date(now);
      currentDate.setDate(currentDate.getDate() + i);

      const isWeekend =
        currentDate.getDay() === 6 || currentDate.getDay() === 0;
      if (isWeekend) continue;

      for (const doctor of doctors) {
        const slots = generateTimeSlots();

        for (const { start, end } of slots) {
          slotsToInsert.push({
            doctor_id: doctor._id,
            clinic_id: doctor.clinic_id,
            date: new Date(currentDate),
            start_time: start,
            end_time: end,
            is_booked: false,
          });
        }
      }
    }

    await AvailabilitySlotModel.insertMany(slotsToInsert);

    res.status(201).json({
      message: "Seeded availability slots",
      count: slotsToInsert.length,
    });
  } catch (error) {
    console.error("Error seeding availability slots:", error);
    res.status(500).json({ message: "Seeding failed", error });
  }
};
