import { Router } from "express";
import { getAvailabilityOverview } from "../controllers/secretary/secretary.controller";
import { authenticateJWT } from "../middleware/authenticateJWT.middleware";
import { AvailabilitySlotModel } from "../models/availabilityslots.model";
import mongoose from "mongoose";

const router = Router();

router.get("/", authenticateJWT, getAvailabilityOverview);

// Seed testdata
router.post("/seed", async (req, res) => {
  try {
    const doctorId = new mongoose.Types.ObjectId("681766d7417431c949707908");

    const today = new Date();
    const slots = [];

    // vi genererer test-slots for 5 dage i træk
    for (let i = 0; i < 5; i++) {
      // Vi starter med i dag, og så lægger vi 0 til 4 dage til, én dag ad gangen (man-fre)
      const date = new Date(today);
      date.setDate(today.getDate() + i); // i dag + i dage

      //   to tider hver dag
      //   Det her tilføjer to ledige slots pr. dag til lægen:
      slots.push(
        {
          doctor_id: doctorId,
          date,
          start_time: "09:00",
          end_time: "09:30",
          is_booked: false,
        },
        {
          doctor_id: doctorId,
          date,
          start_time: "10:00",
          end_time: "10:30",
          is_booked: false,
        }
      );
    }

    await AvailabilitySlotModel.insertMany(slots);

    res.status(201).json({ message: "Seeded 10 slots!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error seeding slots", error });
  }
});

export default router;
