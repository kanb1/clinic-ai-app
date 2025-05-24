import { Request, Response } from "express";
import { MessageModel } from "../../models/message.model";
import { IPopulatedMessage } from "../../interfaces/IPopulatedMessage";
import mongoose from "mongoose";
import { UserModel } from "../../models/user.model";
import { AppointmentModel } from "../../models/appointment.model";
import { AvailabilitySlotModel } from "../../models/availabilityslots.model";

// **************************************************** BESKEDER
// HENT NYE BESKEDER
export const getUnreadMessages = async (req: Request, res: Response) => {
  try {
    const clinicId = req.user!.clinicId.toString();
    const userId = req.user!._id.toString();
    const myRole = req.user!.role;

    // ulæste beskeder
    const messages = await MessageModel.find({ read: false })
      .populate("sender_id", "name role clinic_id") // brugerobjekt af sender_id da det er en objectID
      .populate("receiver_id", "name role");

    //IPopulatedMessage: ts-workaround - populate.() gør objectID til brugerobjekter i runtime men det ved TS ikke, da den stadig ser som objectID
    //as unknown ← ignorer den type, TypeScript tror det er
    // as IPopulatedMessage[] ← brug i stedet denne type (vores interface)
    // vi fortæller ts at messages faktisk er en array af vores interface for autocomplete og typesikkerhed
    const filtered = (messages as unknown as IPopulatedMessage[]).filter(
      (msg) => {
        const sender = msg.sender_id;
        // Tjekker at sender_id er et objekt og ikke null
        // at det har et clinic og den matcher logged in brugers clinic
        const fromSameClinic =
          typeof sender === "object" &&
          // "sender"-objektet har et felt der hedder "clinic_id"
          "clinic_id" in sender &&
          sender.clinic_id?.toString() === clinicId;

        //Håndterer flere tilfælde, om receiver_scope er til all eller staff eller en indiivudel eller patienter
        // problemet er at receiver_scope kan være flere forskellige ting, en string "all" eller et objekt emd _id, navn osv
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
    res.status(500).json({ message: "Failed to get unread messages", error });
  }
};

// SEND NY BESKED TIL PATIENT
export const sendMessage = async (req: Request, res: Response) => {
  try {
    const { content, type, receiver_scope, receiver_id } = req.body;

    if (!content || !type || !receiver_scope) {
      res.status(400).json({ message: "All fields are required" });
      return;
    }

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
      sender_id: req.user!._id, // sekretæren der er logget ind
      // ternary operator(kort version af ifelse) Hvis receiver_scope er "individual", så brug den receiver_id, som vi har fået med i req.body. Ellers sæt receiver_id til null
      receiver_id:
        receiver_scope === "individual"
          ? new mongoose.Types.ObjectId(receiver_id)
          : null,
      receiver_scope,
      content,
      type,
    });

    res.status(201).json({ message: "Message sent", newMessage });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error sending message", error });
  }
};

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

    // Hvis allerede læst
    if (message.read) {
      res.status(200).json({ message: "Message is already marked as read" });
      return;
    }

    message.read = true;
    await message.save();

    res.status(200).json({ message: "Message marked as read by secretary" });
  } catch (error) {
    res.status(500).json({ message: "Failed to mark message as read", error });
  }
};

// **************************************************** PATIENT OG LÆGEOPSÆTNING
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
    res.status(500).json({ message: "Failed to search patients", error });
  }
};

export const getDoctors = async (req: Request, res: Response) => {
  try {
    const clinicId = req.user!.clinicId;

    const doctors = await UserModel.find({
      role: "doctor",
      clinic_id: clinicId,
    });

    res.status(200).json(doctors);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch doctors", error });
  }
};

// **************************************************** Kalender og ledige tider
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
    res.status(500).json({ message: "Failed to fetch appointments", error });
  }
};

// Dette endpoint viser et overblik over hvor mange tider der er ledige for hver læge grupperet per dag
// Valgfri filtrering på doctorId
// Returnerer antal ledige tider grupperet per læge per dag
// Sorter: dato stigende, navn A–Z.
export const getAvailabilityOverview = async (req: Request, res: Response) => {
  try {
    // weekstart altså startdatoen
    const { weekStart, doctorId } = req.query;

    if (!weekStart) {
      res
        .status(400)
        .json({ message: "weekStart is required (e.g. 2025-05-05)" });
      return;
    }

    // Konverterer weekStart til en Date-objekt, og laver en endDate der er 20 dage frem i tid (næsten 3 uger) for at filtrere tiderne
    const startDate = new Date(weekStart as string);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 20); // 3 uger frem

    // Forbereder mongo match query:
    const match: any = {
      date: { $gte: startDate, $lte: endDate }, //date skal være mellem startDate og endDate
      is_booked: false, //is_booked skal være false (altså ledige tider)
    };

    // Tilføj lægefilter hvis doctorId er angivet
    // Hvis doctorId findes og er gyldig (et objectid), tilføjer vi det til vores filter, så vi kun får tider for 1 bestemt læge.
    if (doctorId && mongoose.Types.ObjectId.isValid(doctorId as string)) {
      match.doctor_id = new mongoose.Types.ObjectId(doctorId as string);
    }

    if (!weekStart) {
      res
        .status(400)
        .json({ message: "weekStart is required (e.g. 2025-05-05)" });
      return;
    }

    if (doctorId && !mongoose.Types.ObjectId.isValid(doctorId as string)) {
      // Hvis der er en doctorId, men den er ugyldig → returner tomt array
      res.status(200).json([]);
      return;
    }

    // Aggregations pipeline for at gruppere tiderne -> kompleks forespørgsel med en pipeline af mongo's operationer ($)
    const slots = await AvailabilitySlotModel.aggregate([
      // Vi starter en aggregation og filtrerer først med vores match (dato og evt. lægefilter)
      { $match: match },
      // Vi grupperer resultaterne efter læge og dato og tæller hvor mange ledige tider der er ($sum: 1)
      // Svarer til GROUP BY i SQL
      // fx 2 ledige tider for hanne hansen og 3 for jens jensen så får jeg dem som separate rækker
      // "Læg alle slots sammen, hvor lægen og datoen er den samme"
      {
        $group: {
          _id: {
            doctor_id: "$doctor_id",
            date: "$date",
          },
          // → “læg +1 sammen for hvert dokument” → tælling
          availableSlots: { $sum: 1 },
        },
      },
      //$lookup for at hente info om lægen fra users-collectionen og tilføjer det som et felt kaldet doctor, fungerer lidt som JOIN
      {
        $lookup: {
          // Gå ind i users-collectionen
          from: "users",
          //Jeg har en doctor_id i mit nuværende dokument (under _id og som lige er lavet i $group)
          localField: "_id.doctor_id",
          // Find den bruger i users hvor _id matcher det doctor_id jeg har
          foreignField: "_id",
          // Gem det fundne brugerobjekt som et nyt felt, kaldet doctor
          as: "doctor",
        },
      },
      // $unwind gør så doctor bliver et enkelt ojbject og ik et array. "Pakker" en array ud til ét dokument per element
      { $unwind: "$doctor" },
      // Vi definerer hvilke felter vi vil have med i resultatet
      // doctor oplysninger, hvornår tiderne er og hvor mange tider
      {
        $project: {
          doctorId: "$doctor._id",
          doctorName: "$doctor.name",
          role: "$doctor.role",
          date: "$_id.date",
          availableSlots: 1,
        },
      },
      // Sorter resultatet: vi vil have datoer i stigende rækkefølge, fx man-fre og navne i alfabetisk orden
      { $sort: { date: 1, doctorName: 1 } },
    ]);

    res.status(200).json(slots);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Failed to fetch availability slots", error });
  }
};

//Dette endpoint viser de konkrete ledige tider, altså tidspunkt og dato for hver ledig tid for hver læge
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
      is_booked: false,
    };

    if (doctorId && mongoose.Types.ObjectId.isValid(doctorId as string)) {
      match.doctor_id = new mongoose.Types.ObjectId(doctorId as string);
    }

    const slots = await AvailabilitySlotModel.find(match)
      .populate("doctor_id", "name")
      .sort({ date: 1, start_time: 1 });

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

    const formatted = (slots as unknown as PopulatedSlot[]).map((slot) => ({
      slotId: slot._id,
      doctorId: slot.doctor_id._id,
      doctorName: slot.doctor_id.name,
      date: slot.date,
      start_time: slot.start_time,
      end_time: slot.end_time,
    }));

    res.status(200).json(formatted);
  } catch (error) {
    console.error("Failed to fetch slots:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

// **************************************************** Booking og notering
export const createAppointment = async (req: Request, res: Response) => {
  try {
    const { patient_id, doctor_id, slot_id } = req.body;
    const clinicId = req.user!.clinicId;

    if (!patient_id || !doctor_id || !slot_id) {
      res.status(400).json({ message: "Missing required fields" });
      return;
    }

    // Vi finder den valgte slot med slot_id fra databasen
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

    // Opret aftale baseret på slot info
    const appointment = await AppointmentModel.create({
      patient_id,
      doctor_id,
      clinic_id: clinicId,
      date: slot.date,
      time: slot.start_time,
      end_time: slot.end_time,
      status: "venter", //default, når patient bekræfter, så ændrer vi status via patch-endpoint
    });

    // Marker slot som booket og gem
    slot.is_booked = true;
    await slot.save();

    res.status(201).json({ message: "Appointment created", appointment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating appointment", error });
  }
};

export const addSymptomNote = async (req: Request, res: Response) => {
  try {
    const appointmentId = req.params.id;
    const { note } = req.body;

    if (!note) {
      res.status(400).json({ message: "Note is required" });
      return;
    }

    const appointment = await AppointmentModel.findById(appointmentId);

    if (!appointment) {
      res.status(404).json({ message: "Appointment not found" });
      return;
    }

    // kun tilføj en note hvis den ik allerede har
    if (appointment.secretary_note) {
      res.status(400).json({ message: "Note already exists" });
      return;
    }

    appointment.secretary_note = note;
    await appointment.save();

    res.status(200).json({ message: "Symptom note added", appointment });
  } catch (error) {
    res.status(500).json({ message: "Error adding note", error });
  }
};

// **************************************************** Dashboard og historik

// Hent besøg for i dag
export const getTodaysAppointments = async (req: Request, res: Response) => {
  try {
    const clinicId = req.user!.clinicId;

    // Lav et datointerval fra start til slut på dagen
    const today = new Date();
    today.setHours(0, 0, 0, 0); //Sætter tidspunktet til midnat (starten på dagen).

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1); // næste dag = grænse

    const appointments = await AppointmentModel.find({
      clinic_id: clinicId,
      // Grænser: gte og lt er "greater than equal" og "less than or equal"
      date: { $gte: today, $lt: tomorrow }, //Matcher alle tidspunkter i dag, (mellem de to grænser).
    })
      .populate("patient_id", "name")
      .populate("doctor_id", "name")
      .sort({ time: -1 }); //time refererer til feltet "time" i mine appointments, fx "14:30", "09:15", "11:00" osv., den sorterer efter det fra højeste til laveste så seneste kommer først

    res.status(200).json(appointments);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch today’s appointments", error });
  }
};

// skal vise alle dagens aftaler indtil nu
// Hente kun dagens aftaler, altså fra midnat og frem.
// Filtrere dem baseret på tidspunkt, så det kun er tider før nu.
export const getPastAppointmentsToday = async (req: Request, res: Response) => {
  try {
    const clinicId = req.user!.clinicId;

    // aktuelle tidspunkt
    const now = new Date();
    //er i dag kl. 00:00, så vi kan filtrere alt der sker fra i dag og frem
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    // find alle appointments som:
    const appointments = await AppointmentModel.find({
      clinic_id: clinicId, //der tilhører denne klinik
      date: { $gte: startOfDay }, // som har en date fra i dag og frem
      status: { $in: ["bekræftet", "udført", "aflyst"] }, //de her statusser vil vi gerne se
    })
      .populate("patient_id", "name")
      .populate("doctor_id", "name"); //Populerer patient og læge navn, så vi får deres navne med i stedet for bare deres ID’er.

    // Trækker timer og minutter ud af now (altså tidspunktet lige nu), fx 17 og 25
    const nowHours = now.getHours();
    const nowMinutes = now.getMinutes();

    const filtered = appointments.filter((appt) => {
      // Splitter appt.time, som fx er "10:30", til hourStr = "10" og minuteStr = "30"
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

    // Sorter og begræns til de 4 nyeste
    const sorted = filtered
      .sort((a, b) => {
        if (a.date.getTime() !== b.date.getTime()) {
          return b.date.getTime() - a.date.getTime(); // nyeste dato først, selvom de alle er i dag, men for en sikkerhedsskyld
        }
        return b.time.localeCompare(a.time); // nyeste tid først (efter tjekket dato)
      })
      .slice(0, 4); //derefter begrænser vi til de 4 nyeste

    res.status(200).json(sorted);
  } catch (error) {
    console.error("Error fetching past appointments:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch past appointments", error });
  }
};
