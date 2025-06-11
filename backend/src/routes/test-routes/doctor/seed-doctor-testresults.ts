import { JournalModel } from "../../../models/journal.model";
import { JournalEntryModel } from "../../../models/journalentry.model";
import { TestResultModel } from "../../../models/testresult.model";
import { Request, Response } from "express";
import mongoose from "mongoose";

// SEED TESTRESULTS
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
    res.status(500).json({
      message: "Could not complete this task. Try again later",
    });
  }
};
