import { Request, Response } from "express";
import { ClinicModel } from "../../models/clinic.model";

// Opret clinic
export const createClinic = async (req: Request, res: Response) => {
  try {
    const { name, address } = req.body;
    const adminId = req.user!._id;

    // Tjekker om admin allerede har oprettet en klinik
    const existingClinic = await ClinicModel.findOne({ created_by: adminId });

    if (existingClinic) {
      res.status(400).json({
        message:
          "Du har allerede oprettet en klinik. Hver admin kan kun eje én klinik.",
      });
      return;
    }
    const clinic = await ClinicModel.create({
      name,
      address,
      created_by: adminId, // kræver at brugeren er logget ind
    });
    res.status(201).json(clinic);
  } catch (error) {
    console.error("Could not create the clinic", error);
    res.status(500).json({ message: "Error" });
  }
};

// Hent klinikker
export const getClinics = async (req: Request, res: Response) => {
  try {
    const clinics = await ClinicModel.find();
    res.json(clinics);
  } catch (error) {
    console.error("Could not get clinics", error);

    res.status(500).json({ message: "Error" });
  }
};

// Find specifik klinik by Id - baseret på relation
// bruges ikke i frontend men klar til fremtidigt brug -> vis klinikkens info påd ashboard fx
// læger/sekretær
export const getClinicById = async (req: Request, res: Response) => {
  try {
    // udtrækker id'et af klinik fra URL, og gemmer i clinicId
    const clinicId = req.params.id;
    const clinic = await ClinicModel.findById(clinicId);

    if (!clinic) {
      res.status(404).json({ message: "Clinic not found" });
      return;
    }

    res.status(200).json(clinic);
  } catch (error) {
    console.error("Error fetching clinic by ID:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Hent specifik klinik for admin - baseret på ejerskab
export const getMyClinic = async (req: Request, res: Response) => {
  try {
    const adminId = req.user!._id;
    const clinic = await ClinicModel.findOne({ created_by: adminId });

    if (!clinic) {
      res
        .status(404)
        .json({ message: "Du har ikke oprettet en klinik endnu." });
      return;
    }

    res.status(200).json(clinic);
    return;
  } catch (error) {
    console.error("Could not get my clinic", error);

    res.status(500).json({ message: "Serverfejl" });
  }
};
