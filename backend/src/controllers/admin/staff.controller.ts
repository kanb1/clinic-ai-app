import { Request, Response } from "express";
import { UserModel } from "../../models/user.model";
import bcrypt from "bcryptjs";

// FÅ FAT PÅ ALLE MEDARBEJDERE
export const getStaff = async (req: Request, res: Response) => {
  try {
    const staff = await UserModel.find({
      role: { $in: ["doctor", "secretary"] },
    }).select("-password_hash");
    res.status(200).json(staff);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch the staff", error });
  }
};

//************************* */ MANAGE DOCTORS
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

    // hasher password -> Vi vil ik gemme klartekst pass i db
    const hashed = await bcrypt.hash(password, 10);

    // opretter ny bruger med usermodel.create til db
    const newDoctor = await UserModel.create({
      name,
      email,
      password_hash: hashed,
      role: "doctor", //vigtigt for rbac
      clinic_id,
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

//************************* MANAGE SECRETARY
export const addSecretary = async (req: Request, res: Response) => {
  try {
    const { name, email, password, clinic_id } = req.body;
    if (!name || !email || !password || !clinic_id) {
      res.status(400).json({ message: "Please enter all the required fields" });
      return;
    }

    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: "Email already in use" });
      return;
    }

    const hashed = await bcrypt.hash(password, 10);

    const newSecretary = await UserModel.create({
      name,
      email,
      password_hash: hashed,
      role: "secretary",
      clinic_id,
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

//************************* MANAGE PATIENTS
