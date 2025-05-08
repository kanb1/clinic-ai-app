import express from "express";
import { JournalModel } from "../models/journal.model";
import { UserModel } from "../models/user.model";

const testRouter = express.Router();

// Midlertidig: Opret testjournal til patient - // SEEEEED
testRouter.post("/journals/test-create", async (req, res) => {
  const { patient_id } = req.body;

  if (!patient_id) {
    res.status(400).json({ message: "patient_id is required" });
    return;
  }

  try {
    const patient = await UserModel.findById(patient_id);
    if (!patient || patient.role !== "patient") {
      res.status(404).json({ message: "Patient not found" });
      return;
    }

    const existingJournal = await JournalModel.findOne({ patient_id });
    if (existingJournal) {
      res
        .status(200)
        .json({ message: "Journal already exists", journal: existingJournal });
      return;
    }

    const newJournal = await JournalModel.create({
      patient_id,
      entries: [],
    });

    res.status(201).json({ message: "Journal created", journal: newJournal });
  } catch (error) {
    res.status(500).json({ message: "Failed to create test journal", error });
  }
});

export default testRouter;
