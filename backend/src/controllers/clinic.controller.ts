import { Request, Response } from "express";
import { ClinicModel } from "../models/clinic.model";

export const createClinic = async (req: Request, res: Response) => {
  try {
    const { name, address } = req.body;
    const clinic = await ClinicModel.create({
      name,
      address,
      created_by: req.user!.userId, // kræver at brugeren er logget ind
    });
    res.status(201).json(clinic);
  } catch (error) {
    res.status(500).json({ message: "Error when creating clinic", error });
  }
};

export const getClinics = async (req: Request, res: Response) => {
  try {
    const clinics = await ClinicModel.find();
    res.json(clinics);
  } catch (error) {
    res.status(500).json({ message: "Error fetching the clinics", error });
  }
};
