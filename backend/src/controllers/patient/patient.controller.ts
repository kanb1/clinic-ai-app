import { Request, Response } from "express";
import { MessageModel } from "../../models/message.model";
import { AppointmentModel } from "../../models/appointment.model";
import { PrescriptionModel } from "../../models/prescription.model";
import { UserModel } from "../../models/user.model";

// *********************************************************** MESSAGES
export const getUnreadMessagesForPatient = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = req.user!._id;

    const messages = await MessageModel.find({
      // beskeder der ik er læst
      read: false,
      // og en af følgende to betingelser skal være opfyldt:
      $or: [
        { receiver_id: userId }, // beskeden er sendt direkte til patienten
        { receiver_id: "all" }, // beskeden er en fællesbesked (broadcast)
      ],
    })
      .populate("sender_id", "name role clinic_id") //populate -> vi får ik bare objectId men populate gør det til objekter med selve brugerens data
      .sort({ createdAt: -1 }); //sorterer efter nyeste først -> faldende rækkefølge

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch unread messages", error });
  }
};

export const markMessageAsRead = async (req: Request, res: Response) => {
  try {
    const messageId = req.params.id;
    const userId = req.user!._id;

    const message = await MessageModel.findById(messageId);

    if (!message) {
      res.status(404).json({ message: "Message not found" });
      return;
    }

    // Hvis det er en broadcast, kan den ikke markeres som læst
    if (message.receiver_id === "all") {
      res
        .status(403)
        .json({ message: "Broadcast messages cannot be marked as read" });
      return;
    }

    // Må kun markeres læst af modtageren selv
    // Vi laver receiver_id.toString() fordi det er en objectId, og userId er en string.
    if (message.receiver_id?.toString() !== userId) {
      res
        .status(403)
        .json({ message: "You are not authorized to mark this message" });
      return;
    }

    // Her markerer jeg beskeden som læst og gemmer ændringen i db
    message.read = true;
    await message.save();

    res.status(200).json({ message: "Message marked as read" });
  } catch (error) {
    res.status(500).json({ message: "Failed to mark message as read", error });
  }
};

// *********************************************************** Aftalehåndtering
export const getUpcomingAppointments = async (req: Request, res: Response) => {
  try {
    const patientId = req.user!._id;

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Starter ved midnat i dag

    const upcomingAppointments = await AppointmentModel.find({
      patient_id: patientId,
      // gte står for greater than or equal altså datoer fra i dag og frem
      date: { $gte: new Date() }, // fra i dag og frem
      // "$in" betyder vælg kun aftaler med en af disse statusser
      status: { $in: ["bekræftet", "venter"] }, // kun relevante statusser
    })
      .sort({ date: 1 }) //sorterer efter stigende dato
      .populate("doctor_id", "name")
      .populate("clinic_id", "name");

    res.status(200).json(upcomingAppointments);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch upcoming appointments", error });
  }
};

export const confirmAppointment = async (req: Request, res: Response) => {
  try {
    const appointmentId = req.params.id;
    const userId = req.user!._id;

    // Find aftalen og tjek at den tilhører brugeren
    const appointment = await AppointmentModel.findById(appointmentId);

    if (!appointment) {
      res.status(404).json({ message: "Aftale ikke fundet" });
      return;
    }

    // gør patient_id til en string da det en objectId, det samme med userId
    if (appointment.patient_id.toString() !== userId.toString()) {
      res.status(403).json({ message: "Du må ikke ændre denne aftale" });
      return;
    }

    appointment.status = "bekræftet";
    await appointment.save();

    res.status(200).json({ message: "Aftale bekræftet" });
  } catch (error) {
    res.status(500).json({ message: "Noget gik galt", error });
  }
};

export const cancelAppointment = async (req: Request, res: Response) => {
  try {
    const appointmentId = req.params.id;
    const userId = req.user!._id; // fra JWT

    // Find aftalen
    const appointment = await AppointmentModel.findById(appointmentId);

    if (!appointment) {
      res.status(404).json({ message: "Ikke mulgit at finde aftale" });
      return;
    }

    // Patienten må kun aflyse egne aftaler
    if (appointment.patient_id.toString() !== userId.toString()) {
      res
        .status(403)
        .json({ message: "Du har ikke adgang til at aflyse denne aftale" });
      return;
    }

    appointment.status = "aflyst";
    await appointment.save();

    res.status(200).json({ message: "Aftale blev aflyst" });
  } catch (error) {
    res.status(500).json({ message: "Noget gik galt ved aflysning", error });
  }
};

// *********************************************************** Sundhedsdata
export const getPrescriptionsForPatient = async (
  req: Request,
  res: Response
) => {
  try {
    const { patientId } = req.params;

    // Find alle recepter til logged in patient
    const prescriptions = await PrescriptionModel.find({
      patient_id: patientId,
    }).sort({ issued_date: -1 }); // nyeste først

    res.status(200).json(prescriptions);
  } catch (error) {
    console.error("Fejl ved hentning af recepter:", error);
    res.status(500).json({
      message: "Noget gik galt ved hentning af recepter.",
      error,
    });
  }
};

// *********************************************************** Brugerprofil
export const updateMyProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user!._id;
    const { email, phone } = req.body;

    if (!email && !phone) {
      res
        .status(400)
        .json({ message: "Du skal angive e-mail og/eller telefonnummer" });
      return;
    }

    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      // $set = "Sæt disse felter til disse værdier", fx email sættes til dne nye værdi af email, men kun hvis den er ændret, ellers forbliver de det samme
      { $set: { email, phone } },
      // new: returner den opdaterede version af dokumentet, ikke den gamle (findbyidandupdate)
      // runvalidators: den kører validation fra mit schema
      { new: true, runValidators: true }
    ).select("-password_hash");

    if (!updatedUser) {
      res.status(404).json({ message: "Bruger ikke fundet" });
      return;
    }

    res.status(200).json({
      message: "Dine oplysninger er opdateret",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Fejl ved opdatering:", error);
    res.status(500).json({ message: "Noget gik galt", error });
  }
};

// *********************************************************** AI/Chatbot
