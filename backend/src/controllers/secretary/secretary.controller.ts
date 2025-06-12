import { Request, Response } from "express";
import { MessageModel } from "../../models/message.model";
import { IPopulatedMessage } from "../../interfaces/IPopulatedMessage";
import mongoose, { ObjectId, Types } from "mongoose";
import { UserModel } from "../../models/user.model";
import { AppointmentModel } from "../../models/appointment.model";
import { AvailabilitySlotModel } from "../../models/availabilityslots.model";
import { generateTimeSlots } from "../../utils/slot.utils";
import { IUser } from "../../types/user.types";

// **************************************************** BESKEDER
// **************************************************** BESKEDER
// **************************************************** BESKEDER
// **************************************************** BESKEDER
// HENT NYE BESKEDER
export const getUnreadMessages = async (req: Request, res: Response) => {
  try {
    const clinicId = req.user!.clinicId.toString();
    const userId = req.user!._id.toString();
    const myRole = req.user!.role;

    // ulæste beskeder
    const messages = await MessageModel.find({ read: false })
      .populate("sender_id", "name role clinic_id")
      .populate("receiver_id", "name role")
      .sort({ createdAt: -1 });

    // IPopulatedMessage: ts-workaround
    const filtered = (messages as unknown as IPopulatedMessage[]).filter(
      (msg) => {
        const sender = msg.sender_id;

        // Tjekker at sender_id er et objekt og ikke null
        // at det har et clinic og den matcher logged in brugers clinic
        const fromSameClinic =
          sender &&
          typeof sender === "object" &&
          // "sender"-objektet har et felt der hedder "clinic_id"
          sender.clinic_id != null && // både null og undefined filtreres væk
          sender.clinic_id.toString() === clinicId;

        //Håndterer flere tilfælde, om receiver_scope er til all eller staff eller en indiivudel eller patienter
        // receiver_scope -> håndterer både en string "all"/objekt emd _id, navn osv
        const toCurrentUser =
          // er besked sendt til alle? så matcher den direkte
          msg.receiver_scope === "all" ||
          (msg.receiver_scope === "staff" &&
            (myRole === "doctor" || myRole === "secretary")) ||
          (msg.receiver_scope === "patients" && myRole === "patient") ||
          (msg.receiver_scope === "individual" &&
            // er receiver_id et objekt (typeof)
            // hvis det ikke er en string, men faktisk et objekt, fordi det et populate resultat, så fortsæt
            typeof msg.receiver_id === "object" &&
            // "in" indeholder det her objekt også et _id?
            "_id" in msg.receiver_id &&
            // as unknown: ts ved ik om receiver.id er all eller objectid osv. vi antager det som unknown
            // as {id..}: nu antager vi at det faktisk er et objekt med et _id-felt
            // lidt modsigende, men ts-teknik tila t bypasse ts' stramme typer indtil vi ved mere end ts gør -> men nu ved jeg.. fordi jeg tjekkede med typeof og in tidligere
            (
              msg.receiver_id as unknown as { _id: mongoose.Types.ObjectId }
            )._id.toString() === userId);

        // besked kommer kun frem i fitleret hvis begge tjek ovenfor er true, fra samme klinik og til denne her user
        return fromSameClinic && toCurrentUser;
      }
    );

    res.status(200).json(filtered);
  } catch (error) {
    console.error("Error in getUnreadMessages:", error);
    if (error instanceof Error) {
      console.error(error.message);
      console.error(error.stack);
    }
    res.status(500).json({ message: "Failed to complete this task" });
  }
};

// SEND NY BESKED TIL PATIENT
export const sendMessage = async (req: Request, res: Response) => {
  try {
    const { content, type, receiver_scope, receiver_id } = req.body;

    if (receiver_scope === "individual" && !receiver_id) {
      res
        .status(400)
        .json({ message: "receiver_id is required for individual messages" });
      return;
    }

    // Hvis receiver_id ikke er "all", skal det være en ObjectId
    if (receiver_scope === "individual") {
      if (!receiver_id || !mongoose.Types.ObjectId.isValid(receiver_id)) {
        res.status(400).json({ message: "Invalid receiver_id" });
        return;
      }
    }

    const newMessage = await MessageModel.create({
      sender_id: req.user!._id,
      receiver_id:
        receiver_scope === "individual"
          ? new mongoose.Types.ObjectId(receiver_id)
          : null,
      receiver_scope,
      content,
      type,
    });

    res.status(201).json({ message: "Message sent", newMessage });
  } catch (error: any) {
    console.error(error);

    if (error.message && error.message.toLowerCase().includes("rate limit")) {
      res.status(429).json({
        message: "For mange beskeder sendt på kort tid. Nulstiller om 20 min.",
      });
      return;
    }

    // Ellers send generel 500:
    res.status(500).json({ message: "Error" });
  }
};

// Marker besked som læst
export const markMessageAsReadBySecretary = async (
  req: Request,
  res: Response
) => {
  try {
    const messageId = req.params.id;

    const message = await MessageModel.findById(messageId);

    if (!message) {
      res.status(404).json({ message: "Message not found" });
      return;
    }

    if (message.read) {
      res.status(200).json({ message: "Message is already marked as read" });
      return;
    }

    message.read = true;
    await message.save();

    res.status(200).json({ message: "Message marked as read by secretary" });
  } catch (error) {
    console.error("Failed to mark message as read", error);
    res.status(500).json({ message: "Error" });
  }
};

// **************************************************** PATIENT OG LÆGEOPSÆTNING
// **************************************************** PATIENT OG LÆGEOPSÆTNING
// **************************************************** PATIENT OG LÆGEOPSÆTNING
// **************************************************** PATIENT OG LÆGEOPSÆTNING
// Søg efter patient
export const searchPatients = async (req: Request, res: Response) => {
  try {
    const clinicId = req.user!.clinicId;
    // tjekker om klienten har sendt en ?serach=.. i urlen - ellers bliver den bare undefined
    const searchQuery = req.query.search as string;

    // kriterier for denne her searchquery
    const query = {
      role: "patient",
      clinic_id: clinicId,
    };

    // Vi laver en RegEx søgning, så vi kan finde navne, e-mails eller CPR-numre - uanset stor/små bogstav men i string
    if (searchQuery) {
      // Laver et RegEx-mønster, som matcher fx "anna" hvor som helst i et felt (felt i db kan være alt og i vores tilfælde email, name og cpr)
      const regex = new RegExp(searchQuery, "i"); // case-insensitive søgning
      // Vi tilføjer en ekstra betingelse til vores query
      // or = (ekstra betingelse) Hvis nogen af felterne matcher, så vis resultatet.
      // Den søger altså i både navn, email og cpr samtidig som nedenfor vist
      // {
      //   role: "patient",
      //   clinic_id: "...",
      //   $or: [
      //     { name: /anna/i },
      //     { email: /anna/i },
      //     { cpr_number: /anna/i }
      //   ]
      // }
      Object.assign(query, {
        $or: [{ name: regex }, { email: regex }, { cpr_number: regex }],
      });
    }

    const patients = await UserModel.find(query);
    res.status(200).json(patients);
  } catch (error) {
    console.error("Failed to search patients", error);
    res.status(500).json({ message: "fejl" });
  }
};

// Hent læger
export const getDoctors = async (req: Request, res: Response) => {
  try {
    const clinicId = req.user!.clinicId;

    const doctors = await UserModel.find({
      role: "doctor",
      clinic_id: clinicId,
    });

    res.status(200).json(doctors);
  } catch (error) {
    console.error("Failed to fetch doctors", error);
    res.status(500).json({ message: "fejl" });
  }
};

// **************************************************** Kalender og ledige tider
// **************************************************** Kalender og ledige tider
// **************************************************** Kalender og ledige tider
// **************************************************** Kalender og ledige tider
// Hent alle appointments
export const getAppointments = async (req: Request, res: Response) => {
  try {
    const clinicId = req.user!.clinicId;

    const appointments = await AppointmentModel.find({
      clinic_id: clinicId,
    })
      .populate("patient_id", "name")
      .populate("doctor_id", "name")
      .sort({ date: 1, time: 1 }); // nyeste først

    res.status(200).json(appointments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to complete this tasks" });
  }
};

// Get availability pr. doctor
// Dette endpoint viser et overblik over hvor mange tider der er ledige pr læge grupperet per dag
export const getAvailabilityOverview = async (req: Request, res: Response) => {
  try {
    const { weekStart, doctorId } = req.query;

    if (!weekStart) {
      res
        .status(400)
        .json({ message: "weekStart is required (e.g. 2025-05-05)" });
      return;
    }

    const startDate = new Date(weekStart as string);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 20);

    const match: any = {
      date: { $gte: startDate, $lte: endDate },
      is_booked: false,
    };

    if (doctorId && mongoose.Types.ObjectId.isValid(doctorId as string)) {
      match.doctor_id = new mongoose.Types.ObjectId(doctorId as string);
    }

    const slots = await AvailabilitySlotModel.aggregate([
      { $match: match },

      {
        $addFields: {
          dateOnly: {
            $dateToString: { format: "%Y-%m-%d", date: "$date" },
          },
        },
      },

      {
        $group: {
          _id: {
            doctor_id: "$doctor_id",
            date: "$dateOnly",
          },
          availableSlots: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id.doctor_id",
          foreignField: "_id",
          as: "doctor",
        },
      },
      { $unwind: "$doctor" },
      {
        $project: {
          doctorId: "$doctor._id",
          doctorName: "$doctor.name",
          role: "$doctor.role",
          date: {
            $dateFromString: { dateString: "$_id.date", format: "%Y-%m-%d" },
          },
          availableSlots: 1,
        },
      },
      { $sort: { date: 1, doctorName: 1 } },
    ]);

    res.status(200).json(slots);
  } catch (error) {
    console.error("getAvailabilityOverview error:", error);
    res.status(500).json({ message: "Fail" });
  }
};

// Get specifik availability slots
// giver hver enkelt eldig tid med klokkeslæt
export const getAvailabilitySlots = async (req: Request, res: Response) => {
  try {
    const clinicId = req.user!.clinicId;
    const { weekStart, doctorId } = req.query;

    if (!weekStart) {
      res.status(400).json({ message: "weekStart is required" });
      return;
    }

    const startDate = new Date(weekStart as string);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 20);

    const match: any = {
      clinic_id: clinicId,
      date: { $gte: startDate, $lte: endDate },
      is_booked: false, //ledige tider
    };

    if (doctorId && mongoose.Types.ObjectId.isValid(doctorId as string)) {
      match.doctor_id = new mongoose.Types.ObjectId(doctorId as string);
    }

    // vi hetner alle tiderne der matcher fra databasen
    const slots = await AvailabilitySlotModel.find(match)
      .populate("doctor_id", "name")
      .sort({ date: 1, start_time: 1 });

    // beskriver hvordna hvert slot ser ud efter populate, typesikkerhed
    interface PopulatedSlot {
      _id: string;
      doctor_id: {
        _id: string;
        name: string;
      };
      date: string;
      start_time: string;
      end_time: string;
    }

    // mapper over alle slots (enkelte tider) --> og formaterer dataen
    const formatted = (slots as unknown as PopulatedSlot[]).map((slot) => ({
      slotId: slot._id,
      doctorId: slot.doctor_id._id,
      doctorName: slot.doctor_id.name,
      date: new Date(slot.date).toISOString().split("T")[0], // dato uden tid
      start_time: slot.start_time,
      end_time: slot.end_time,
    }));

    res.status(200).json(formatted);
  } catch (error) {
    console.error("Failed to fetch slots:", error);
    res.status(500).json({ message: "Server error" });
  }
};
// **************************************************** AvailabilitySlots Seeding Fallback
// **************************************************** AvailabilitySlots Seeding Fallback
// **************************************************** AvailabilitySlots Seeding Fallback
// **************************************************** AvailabilitySlots Seeding Fallback
// automatisk fallback-logik, som kun seeder availability slots on-demand ved åbning af booking-siden
// men kun hvis der mangler slots for de næste 21 dage
export const checkAndSeedSlots = async (req: Request, res: Response) => {
  try {
    const clinicId = req.user!.clinicId;

    // finder alle læger i den aktuelle klinik, da vi skal generere slots for hver læge
    const doctors = (await UserModel.find({
      clinic_id: clinicId,
      role: "doctor",
    })) as (IUser & { _id: Types.ObjectId })[];

    if (!doctors.length) {
      res
        .status(404)
        .json({ message: "Ingen læger fundet tilknyttet klinikken." });
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const futureDate = new Date(today);
    futureDate.setDate(futureDate.getDate() + 20);

    // !!check om der allerede findes slots de næste 20 dage
    const existingSlots = await AvailabilitySlotModel.find({
      clinic_id: clinicId,
      date: { $gte: today, $lte: futureDate },
    });

    const existingKeys = new Set(
      existingSlots.map(
        (slot) =>
          `${slot.doctor_id.toString()}-${
            slot.date.toISOString().split("T")[0]
          }`
      )
    );

    // opretter en tom array til nye slots der skal insertes
    const slotsToInsert: {
      doctor_id: Types.ObjectId;
      clinic_id: Types.ObjectId;
      date: Date;
      start_time: string;
      end_time: string;
      is_booked: boolean;
    }[] = [];

    // loop over hver dag de næste 21 dage

    for (let i = 0; i < 21; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      const isoDate = date.toISOString().split("T")[0];

      const isWeekend = date.getDay() === 6 || date.getDay() === 0;
      if (isWeekend) continue;

      for (const doctor of doctors) {
        const key = `${doctor._id.toString()}-${isoDate}`;
        if (existingKeys.has(key)) continue;

        // util funktion der opretter timeslots
        for (const { start, end } of generateTimeSlots()) {
          slotsToInsert.push({
            doctor_id: doctor._id as Types.ObjectId,
            clinic_id: doctor.clinic_id,
            date: new Date(date),
            start_time: start,
            end_time: end,
            is_booked: false,
          });
        }
      }
    }

    // God logging til udvikling!
    // Hvis der var noget at indsætte, bruger vi insertMany()
    if (slotsToInsert.length > 0) {
      await AvailabilitySlotModel.insertMany(slotsToInsert);
      console.log(`Seeded ${slotsToInsert.length} nye tider.`);
      res
        .status(201)
        .json({ message: "Nye tider tilføjet", count: slotsToInsert.length });
      return;
    } else {
      console.log("Ingen nye tider nødvendige – allerede dækket.");
      res
        .status(200)
        .json({ message: "Ingen nye tider nødvendig – alt opdateret." });
      return;
    }
  } catch (error) {
    console.error(" Fejl under check-and-seed:", error);
    res.status(500).json({ message: "Serverfejl" });
    return;
  }
};

// **************************************************** Booking og notering
// Opret aftale
export const createAppointment = async (req: Request, res: Response) => {
  try {
    const { patient_id, doctor_id, slot_id, secretary_note } = req.body;

    const clinicId = req.user!.clinicId;

    const slot = await AvailabilitySlotModel.findById(slot_id);

    if (!slot || slot.is_booked) {
      res.status(400).json({ message: "Slot not available" });
      return;
    }

    const doctor = await UserModel.findById(doctor_id);
    if (!doctor || doctor.role !== "doctor") {
      res.status(400).json({ message: "Ugyldig læge valgt" });
      return;
    }

    const appointment = await AppointmentModel.create({
      patient_id,
      doctor_id,
      clinic_id: clinicId,
      date: new Date(new Date(slot.date).toISOString().split("T")[0]),
      time: slot.start_time,
      end_time: slot.end_time,
      status: "venter",
      secretary_note,
    });

    slot.is_booked = true;
    await slot.save();

    res.status(201).json({ message: "Appointment created", appointment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error" });
  }
};

// Opret secretary_note
export const addSymptomNote = async (req: Request, res: Response) => {
  try {
    const appointmentId = req.params.id;
    const { note } = req.body;

    const appointment = await AppointmentModel.findById(appointmentId);

    if (!appointment) {
      res.status(404).json({ message: "Appointment not found" });
      return;
    }

    if (appointment.secretary_note) {
      res.status(400).json({ message: "Note already exists" });
      return;
    }

    appointment.secretary_note = note;
    await appointment.save();

    res.status(200).json({ message: "Symptom note added", appointment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error" });
  }
};

// **************************************************** Dashboard og historik
// **************************************************** Dashboard og historik
// **************************************************** Dashboard og historik
// **************************************************** Dashboard og historik
// Hent besøgende for i dag
export const getTodaysAppointments = async (req: Request, res: Response) => {
  try {
    const clinicId = req.user!.clinicId;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1); // næste dag = grænse

    const appointments = await AppointmentModel.find({
      clinic_id: clinicId,
      date: { $gte: today, $lt: tomorrow },
    })
      .populate("patient_id", "name")
      .populate("doctor_id", "name")
      .sort({ time: -1 });
    res.status(200).json(appointments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed" });
  }
};

// Hent alle dagens aftaler indtil nu
// Filtrere dem baseret på tidspunkt, så det kun er tider før nu.
export const getPastAppointmentsToday = async (req: Request, res: Response) => {
  try {
    const clinicId = req.user!.clinicId;

    // aktuelle tidspunkt
    const now = new Date();
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const appointments = await AppointmentModel.find({
      clinic_id: clinicId,
      date: { $gte: startOfDay },
      status: { $in: ["bekræftet", "udført", "aflyst"] },
    })
      .populate("patient_id", "name")
      .populate("doctor_id", "name");

    const nowHours = now.getHours();
    const nowMinutes = now.getMinutes();

    const filtered = appointments.filter((appt) => {
      const [hourStr, minuteStr] = appt.time.split(":");
      // Konverterer dem til tal, så vi kan sammenligne dem med det aktuelle tidspunkt
      const apptHour = parseInt(hourStr);
      const apptMin = parseInt(minuteStr);
      // Filtrerer kun de aftaler som:
      return (
        // er i dag
        appt.date.toDateString() === now.toDateString() &&
        // og som allerede er begyndt eller overstået (tidspunkt tidligere end nu)
        (apptHour < nowHours ||
          (apptHour === nowHours && apptMin <= nowMinutes))
      );
    });

    // Sorter og begræns til de 6 nyeste
    const sorted = filtered
      .sort((a, b) => {
        if (a.date.getTime() !== b.date.getTime()) {
          return b.date.getTime() - a.date.getTime(); // nyeste dato først, selvom de alle er i dag, men for en sikkerhedsskyld
        }
        return b.time.localeCompare(a.time); // nyeste tid først (efter tjekket dato)
      })
      .slice(0, 6);

    res.status(200).json(sorted);
  } catch (error) {
    console.error("Error fetching past appointments:", error);
    res.status(500).json({ message: "Failed" });
  }
};
