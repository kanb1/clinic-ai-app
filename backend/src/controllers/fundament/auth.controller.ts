import { Request, Response } from "express";
import { UserModel } from "../../models/user.model";
import bcrypt from "bcryptjs";
import jwt, { JwtPayload } from "jsonwebtoken";
import { JournalModel } from "../../models/journal.model";
import { v4 as uuidv4 } from "uuid";
import { SessionModel } from "../../models/session.model";

// Allerede eksisterende login...

// bruges ikke i frontend..
export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role, clinic_id } = req.body;

    if (!name || !email || !password || !role || !clinic_id) {
      res.status(400).json({ message: "All fields are required!" });
      return;
    }

    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: "User already exists!" });
      return;
    }

    // Create new user
    const user = new UserModel({
      name,
      email,
      password_hash: password,
      role,
      clinic_id,
    });

    await user.save();

    // Hvis det er en patient, opret også journal
    if (role === "patient") {
      await JournalModel.create({ patient_id: user._id });
    }

    res.status(201).json({ message: "User got created successfully", user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await UserModel.findOne({ email }).select("+password_hash");

    if (!user) {
      res.status(400).json({ message: "Invalid credentials" });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      res.status(400).json({ message: "Invalid credentials" });
      return;
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("Missing JWT_SECRET environment variable");
    }

    // unikt Id jeg selv laver og tilføjer til payload
    const jti = uuidv4();

    // gemmer i db, hvor vi kontrollerer den i authmiddleware
    await SessionModel.create({ jti });

    // hemmelig signatur-kode som sidste del af toket "header . payload . signature"
    // ingen kan ændre token
    const token = jwt.sign(
      {
        _id: user._id,
        role: user.role,
        clinicId: user.clinic_id,
        jti,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        clinicId: user.clinic_id,
      },
    });
    return;
  } catch (error) {
    console.error(error);
    res.status(429).json({
      message: "For mange loginforsøg. Prøv igen om 15 minutter.",
    });
    res.status(500).json({ message: "Server error" });
    return;
  }
};

export const logout = async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(400).json({ message: "No token provided" });
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

    // Slet JTI = "log ud"
    await SessionModel.deleteOne({ jti: decoded.jti });

    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.error(error);
    res
      .status(400)
      .json({ message: "Could not complete this task. Try again later" });
  }
};
