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

//************************* MANAGE PATIENTS
