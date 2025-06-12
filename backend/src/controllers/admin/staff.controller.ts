import { Request, Response } from "express";
import { UserModel } from "../../models/user.model";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import crypto from "crypto";
import { MessageModel } from "../../models/message.model";
import { JournalModel } from "../../models/journal.model";

//************************* */ GET ALL STAFFS
export const getStaff = async (req: Request, res: Response) => {
  try {
    const clinicId = req.user!.clinicId;

    const staff = await UserModel.find({
      role: { $in: ["doctor", "secretary"] },
      clinic_id: clinicId,
    }).select("-password_hash");
    res.status(200).json(staff);
  } catch (error) {
    console.error("Error fetching staffs", error);
    res.status(500).json({ message: "Der opstod en fejl. Prøv igen senere." });
  }
};
//************************* */ MANAGE DOCTORS
export const getDoctors = async (req: Request, res: Response) => {
  try {
    const clinicId = req.user!.clinicId;
    const doctors = await UserModel.find({
      role: "doctor",
      clinic_id: clinicId,
    }).select("-password_hash");

    res.status(200).json(doctors);
  } catch (error) {
    console.error("Error getting doctor", error);
    res.status(500).json({ message: "Ressourcerne blev ikke fundet" });
  }
};

export const addDoctor = async (req: Request, res: Response) => {
  try {
    const { name, email, password, phone } = req.body;

    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: "Ugyldige oplysninger. Prøv igen." });
      return;
    }

    const newDoctor = await UserModel.create({
      name,
      email,
      phone,
      password_hash: password,
      role: "doctor",
      clinic_id: req.user!.clinicId,
      status: "ledig",
    });

    res.status(201).json(newDoctor);
  } catch (error) {
    console.error("Error adding new doctor", error);

    res.status(500).json({ message: "Resourcen blev ikke fundet" });
  }
};

export const updateDoctor = async (req: Request, res: Response) => {
  try {
    // /:id, eksempel /x/x/x/doctors/345243de24e
    const { id } = req.params;
    // udtrækker hvad klient har sendt
    const { name, email, phone, address, password, status } = req.body;

    const doctor = await UserModel.findById(id);
    if (!doctor) {
      res.status(404).json({ message: "Resourcen blev ikke fundet" });
      return;
    }

    // opdaterer kun felterne hvis de er blevet sendt med i requesten, hvis ikke så beholder vi den gamle værdi
    //  ?? = nullish coalescing -> Brug venstre værdi (den sendt i requesten) medmindre den er null eller undefined; ellers brug højre (gamle værdi doctor.name)
    doctor.name = name ?? doctor.name;
    doctor.email = email ?? doctor.email;
    doctor.phone = phone ?? doctor.phone;
    doctor.address = address ?? doctor.address;
    doctor.status = status ?? doctor.status;

    // hvis der nyt pass --> gemmer det nye password i password_hash, som middleware hasher
    if (password) {
      doctor.password_hash = password;
    }

    await doctor.save();

    res.status(200).json({ message: "Doctor updated", doctor });
  } catch (error) {
    console.error("Doctor update fejl", error);
    res.status(500).json({ message: "Problemer opstod. Prøven igen senere" });
  }
};

// Slet læge
export const deleteDoctor = async (req: Request, res: Response) => {
  try {
    const doctorId = req.params.id;

    const deleted = await UserModel.findOneAndDelete({
      _id: new mongoose.Types.ObjectId(doctorId),
      role: "doctor",
    });

    if (!deleted) {
      res.status(404).json({ message: "Doctor not found" });
      return;
    }

    res.json({ message: "Doctor deleted successfully" });
  } catch (error) {
    console.error("Error deleting doctor", error);
    res
      .status(500)
      .json({ message: "Der opstod et problem. Prøv igen senere" });
  }
};

//************************* */ MANAGE SECRETARY
export const getSecretaries = async (req: Request, res: Response) => {
  try {
    const clinicId = req.user!.clinicId;
    const secretaries = await UserModel.find({
      role: "secretary",
      clinic_id: clinicId,
    }).select("-password_hash");

    res.status(200).json(secretaries);
  } catch (error) {
    console.error("Could not find secretaries", error);
    res.status(500).json({ message: "Ressourcerne blev ikke fundet" });
  }
};

export const addSecretary = async (req: Request, res: Response) => {
  try {
    const { name, email, password, phone } = req.body;

    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: "Ugyldige oplysninger. Prøv igen." });
      return;
    }

    const newSecretary = await UserModel.create({
      name,
      email,
      phone,
      password_hash: password,
      role: "secretary",
      clinic_id: req.user!.clinicId,
      status: "ledig",
    });

    res.status(201).json(newSecretary);
  } catch (error) {
    console.error("could not create secretary", error);

    res.status(500).json({ message: "Handlingen kunne ikke blive udført" });
  }
};

export const updateSecretary = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, email, phone, address, password } = req.body;

    const secretary = await UserModel.findById(id);
    if (!secretary) {
      res.status(404).json({ message: "Kunne ikke finde ressourcen" });
      return;
    }

    secretary.name = name ?? secretary.name;
    secretary.email = email ?? secretary.email;
    secretary.phone = phone ?? secretary.phone;
    secretary.address = address ?? secretary.address;

    if (password) {
      // Gem plaintext password i password_hash (midlertidigt) – bliver hashet i pre("save")
      secretary.password_hash = password;
    }

    // trigger pre-save hash hvis password er ændret
    await secretary.save();

    res.status(200).json({
      message: "Secretary updated successfully",
      secretary: {
        id: secretary._id,
        name: secretary.name,
        email: secretary.email,
        phone: secretary.phone,
        address: secretary.address,
      },
    });
  } catch (error) {
    console.error("Secretary update fejl", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteSecretary = async (req: Request, res: Response) => {
  try {
    const secretaryId = req.params.id;

    const deleted = await UserModel.findOneAndDelete({
      _id: new mongoose.Types.ObjectId(secretaryId),
      role: "secretary",
    });

    if (!deleted) {
      res.status(404).json({ message: "Kunne ikke finde ressource" });
      return;
    }

    res.json({ message: "Secretary deleted successfully" });
  } catch (error) {
    console.error("Could not delete secretary", error);

    res.status(500).json({ message: "Problemer opstod. Prøv igen senere" });
  }
};

//************************* */ MANAGE PATIENTS
export const getPatients = async (req: Request, res: Response) => {
  try {
    const clinicId = req.user!.clinicId;

    const patients = await UserModel.find({
      role: "patient",
      clinic_id: clinicId,
    }).select("-password_hash");

    res.status(200).json(patients);
  } catch (error) {
    console.error("Could not get patients", error);

    res.status(500).json({ message: "Kunne ikke finde ressourcerne" });
  }
};

export const updatePatient = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, phone, address, email, password } = req.body;

    const patient = await UserModel.findById(id);
    if (!patient || patient.role !== "patient") {
      res.status(404).json({ message: "Kunne ikke finde ressourcen" });
      return;
    }

    patient.name = name ?? patient.name;
    patient.phone = phone ?? patient.phone;
    patient.address = address ?? patient.address;
    patient.email = email ?? patient.email;

    if (password) {
      patient.password_hash = password;
    }

    await patient.save();

    res.status(200).json({
      message: "Patient info got successfully updated",
      patient,
    });
  } catch (error) {
    console.error("Could not update patient", error);

    res.status(500).json({ message: "Problemer opstod. Prøv igen senere" });
  }
};

export const deletePatient = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const deleted = await UserModel.findOneAndDelete({
      _id: id,
      role: "patient",
      clinic_id: req.user!.clinicId, // sikkerhed: kun slet hvis patient hører til admin klinik
    });

    if (!deleted) {
      res.status(404).json({ message: "Kunne ikke finde ressource" });
      return;
    }

    res.status(200).json({ message: "Patient deleted successfully" });
  } catch (error) {
    console.error("Could not delete patient", error);
    res.status(500).json({ message: "Problemer opstod, prøv igen senere" });
  }
};

//************************* */ADMIN
// SEND MESSAGES AS ADMIN
export const sendSystemMessage = async (req: Request, res: Response) => {
  try {
    const { content, receiver_scope, receiver_id } = req.body;

    if (!content || !receiver_scope) {
      res
        .status(400)
        .json({ message: "Indhold og modtagergruppe skal angives." });
      return;
    }

    if (receiver_scope === "individual" && !receiver_id) {
      res.status(400).json({
        message: "receiver_id er påkrævet for individuelle beskeder.",
      });
      return;
    }

    if (
      receiver_scope === "individual" &&
      !mongoose.Types.ObjectId.isValid(receiver_id)
    ) {
      res.status(400).json({ message: "Ugyldigt receiver_id" });
      return;
    }

    const newMessage = await MessageModel.create({
      sender_id: req.user!._id, // admin
      receiver_scope,
      receiver_id:
        receiver_scope === "individual"
          ? new mongoose.Types.ObjectId(receiver_id)
          : null,
      content,
      type: "system", //da det er fra admin er det "system" typen
    });

    res.status(201).json({ message: "Systembesked sendt", newMessage });
  } catch (error) {
    console.error("Fejl ved afsendelse af systembesked:", error);
    res.status(500).json({ message: "Problemer med at udføre denne handling" });
  }
};
