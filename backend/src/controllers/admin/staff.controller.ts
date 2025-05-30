import { Request, Response } from "express";
import { UserModel } from "../../models/user.model";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import crypto from "crypto";
import { MessageModel } from "../../models/message.model";

// FÅ FAT PÅ ALLE MEDARBEJDERE
export const getStaff = async (req: Request, res: Response) => {
  try {
    // JWT middleware sætter dette. Vi skal nemlig kun have staffs fra den clinic admin er administreret til (den tager clinic_id af den admin som er logget ind)
    const clinicId = req.user!.clinicId;

    const staff = await UserModel.find({
      role: { $in: ["doctor", "secretary"] },
      clinic_id: clinicId, // matcher kun ansatte fra samme klinik ved at filtrere med clinic_id af den logged in user.
    }).select("-password_hash");
    res.status(200).json(staff);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch the staff", error });
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
    res.status(500).json({ message: "Failed to fetch doctors", error });
  }
};

export const addDoctor = async (req: Request, res: Response) => {
  try {
    // destrukterer til at hente de felter vi forventer fra frontend (req.body)
    const { name, email, password, clinic_id } = req.body;

    if (!name || !email || !password || !clinic_id) {
      res.status(400).json({ message: "Please enter all the required fields" });
      return;
    }

    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: "Email is already in use" });
      return;
    }

    // opretter ny bruger med usermodel.create til db
    const newDoctor = await UserModel.create({
      name,
      email,
      password_hash: password,
      role: "doctor", //vigtigt for rbac
      clinic_id: req.user!.clinicId, // ← her henter vi klinik-id fra den admin, der er logget ind
      status: "ledig",
    });

    // sender det nye lægeobjekt retur som bekræftelse og debug
    res.status(201).json(newDoctor);
  } catch (error) {
    res.status(500).json({ message: "Failed to create doctor", error });
  }
};

export const updateDoctor = async (req: Request, res: Response) => {
  try {
    // /:id, eksempel /x/x/x/doctors/345243de24e
    const { id } = req.params;
    // Hvad klienten har sendt i bodyen af nye updates. Udtrækker vi.
    const { name, email, phone, address, password, status } = req.body;

    const doctor = await UserModel.findById(id);
    if (!doctor) {
      res.status(404).json({ message: "Doctor not found" });
      return;
    }

    //  opdaterer kun felterne hvis de er blevet sendt med i requesten, hvis ikke så beholder vi den gamle værdi
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

    await doctor.save(); // Triggerer min pre("save") middleware i usermodel

    res.status(200).json({ message: "Doctor updated", doctor });
  } catch (error) {
    res.status(500).json({ message: "Problems updating the doctor", error });
  }
};

// Slet læge
export const deleteDoctor = async (req: Request, res: Response) => {
  try {
    const doctorId = req.params.id;

    const deleted = await UserModel.findOneAndDelete({
      // konverterer den id vi har fået fra URL'en som først var en tekststring, til en objectID, så mongoose forstår
      _id: new mongoose.Types.ObjectId(doctorId),
      role: "doctor",
    });

    if (!deleted) {
      res.status(404).json({ message: "Doctor not found" });
      return;
    }

    res.json({ message: "Doctor deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Problems when deleting doctor", error });
  }
};

//************************* MANAGE SECRETARY
export const getSecretaries = async (req: Request, res: Response) => {
  try {
    const clinicId = req.user!.clinicId;
    const secretaries = await UserModel.find({
      role: "secretary",
      clinic_id: clinicId,
    }).select("-password_hash");

    res.status(200).json(secretaries);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch secretaries", error });
  }
};

export const addSecretary = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      res.status(400).json({ message: "Please enter all the required fields" });
      return;
    }

    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: "Email already in use" });
      return;
    }

    console.log("Creating secretary with password:", password);

    const newSecretary = await UserModel.create({
      name,
      email,
      password_hash: password,
      role: "secretary",
      clinic_id: req.user!.clinicId, // ← her henter vi klinik-id fra den admin, der er logget ind
      status: "ledig",
    });

    res.status(201).json(newSecretary);
  } catch (error) {
    res.status(500).json({ message: "Failed to create secretary", error });
  }
};

export const updateSecretary = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, email, phone, address, password } = req.body;

    const secretary = await UserModel.findById(id);
    if (!secretary) {
      res.status(404).json({ message: "Could not find secretary" });
      return;
    }

    // Opdater felterne kun hvis de er sendt med (ellers behold de gamle værdier)
    secretary.name = name ?? secretary.name;
    secretary.email = email ?? secretary.email;
    secretary.phone = phone ?? secretary.phone;
    secretary.address = address ?? secretary.address;

    if (password) {
      // Gem plaintext password i password_hash (midlertidigt) – bliver hashet i pre("save")
      secretary.password_hash = password;
    }

    await secretary.save(); // trigger pre-save hash hvis password er ændret

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
    console.error(error);
    res.status(500).json({ message: "Server error", error });
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
      res.status(404).json({ message: "Secretary not found" });
      return;
    }

    res.json({ message: "Secretary deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting secretary", error });
  }
};

//************************* MANAGE PATIENTS

//************************************************* */ GET ALL PATIENTS
export const getPatients = async (req: Request, res: Response) => {
  try {
    const clinicId = req.user!.clinicId;

    const patients = await UserModel.find({
      role: "patient",
      clinic_id: clinicId,
    }).select("-password_hash");

    res.status(200).json(patients);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch patients", error });
  }
};

//************************************************* */ LOOKUP PATIENT BY CPR
// Kun adgang for admin eller sekretær
// I starten --> Brugerens basale oplysninger hentes fra CPR registret
// Vigtigt --> modalen popper op med de færdige oplysninger --> frontend mulighed for at vide om det var en eksisterende patient eller om det er en ny dummy, som skal redigeres færdig.
export const lookupPatientByCpr = async (req: Request, res: Response) => {
  const { cpr } = req.params;
  const clinicId = req.user!.clinicId;

  try {
    // Tjekker om patienten allerede findes i klinikken
    const existing = await UserModel.findOne({
      cpr_number: cpr,
      clinic_id: clinicId,
    }).select("-password_hash");

    if (existing) {
      res.status(200).json({
        message: "Patient found",
        patient: existing,
        patientWasFoundBefore: true,
      });
      return;
    }

    // Generérer sikkert tilfældigt password, så feltet ik er blankt/usikkert
    const randomPassword = crypto.randomBytes(16).toString("hex");

    // Opretter dummy data som senere kan redigeres m. modal
    const newPatient = await UserModel.create({
      name: "Ukendt Patient",
      email: `${cpr}@dummy.dk`,
      password_hash: randomPassword,
      role: "patient",
      cpr_number: cpr,
      clinic_id: clinicId,
      status: "ledig",
    });

    // Konverterer Mongoose-dokument til almindeligt objekt, og fjerner password_hash fra det, til når vi returnerer til frontend.
    const patientToReturn = newPatient.toObject();

    // object destructuring -> tag pass_hash ud og safePatient indeholder resten af felterne
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password_hash, ...safePatient } = patientToReturn;
    // ^ESLINT IGNORE! det er for at fjerne linting fejl ved password_hash, da jeg ved at den ikke bliver brugt, men linting kræver det bruges. Hvis jeg bruger delete pass_hash i stedet for object destructuring så får vi ts fejl. Så det er for også at fikse den fejl

    res.status(201).json({
      message: "Patient not found. Dummy patient created.",
      patient: safePatient,
      patientWasFoundBefore: false,
    });
    return;
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error during CPR lookup", error });
  }
};

// Så i frontend: Kald GET /api/patients/lookup/:cpr
//Hvis patient mangler info (f.eks. name === 'Ukendt Patient'), vis en formular/modal op
// Når sekretær/admin er færdig, kald: PUT /api/patients/:id med navn, email osv

export const updatePatient = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, phone, address, email, password } = req.body;

    const patient = await UserModel.findById(id);
    if (!patient || patient.role !== "patient") {
      res.status(404).json({ message: "C ould not find patient" });
      return;
    }

    patient.name = name ?? patient.name;
    patient.phone = phone ?? patient.phone;
    patient.address = address ?? patient.address;
    patient.email = email ?? patient.email;

    // Hvis nyt password medsendes
    if (password) {
      patient.password_hash = password; // Bliver hashed i pre("save")
    }

    await patient.save();

    res.status(200).json({
      message: "Patient info got successfully updated",
      patient,
    });
  } catch (error) {
    res.status(500).json({ message: "Error when updating patient", error });
  }
};

// ************************************************* */ DELETE PATIENTS
export const deletePatient = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const deleted = await UserModel.findOneAndDelete({
      _id: id,
      role: "patient",
      clinic_id: req.user!.clinicId, // sikkerhed: kun slet hvis patient hører til din klinik
    });

    if (!deleted) {
      res.status(404).json({ message: "Patient not found" });
      return;
    }

    res.status(200).json({ message: "Patient deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting patient", error });
  }
};

// ************************************************* */ SEND MESSAGES AS ADMIN

// Vi genbruger samme besked-api "sendMessage" som sekretæren bruger
