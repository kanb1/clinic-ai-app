import { Request, Response } from "express";
import { UserModel } from "../../models/user.model";

// Hent user info (for alle users in general)
export const getMyProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user!._id; // fra JWT payload

    const user = await UserModel.findById(userId).select("-password_hash"); // henter alt undtagen password_hash

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getStaffStatuses = async (req: Request, res: Response) => {
  try {
    const clinicId = req.user!.clinicId;
    const userId = req.user!._id; // fra JWT payload

    const staff = await UserModel.find({
      clinic_id: clinicId,
      role: { $in: ["doctor", "secretary"] },
    }).select("name role status");

    res.status(200).json(staff);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch staff statuses", error });
  }
};

// Update status - til toggle button
export const updateMyOwnStatus = async (req: Request, res: Response) => {
  try {
    const userId = req.user!._id;
    const { status } = req.body;

    const user = await UserModel.findById(userId);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    user.status = status;
    await user.save();

    res.status(200).json({ message: "Status updated", user });
  } catch (error) {
    res.status(500).json({ message: "Error updating status", error });
  }
};

export const getPatients = async (req: Request, res: Response) => {
  try {
    const clinicId = req.user!.clinicId;

    const patients = await UserModel.find({
      role: "patient",
      clinic_id: clinicId,
    });

    res.status(200).json(patients);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch patients", error });
  }
};
