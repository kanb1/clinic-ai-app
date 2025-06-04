import { Request, Response } from "express";
import { MessageModel } from "../../models/message.model";
import { IPopulatedMessage } from "../../interfaces/IPopulatedMessage";
import mongoose, { ObjectId, Types } from "mongoose";
import { UserModel } from "../../models/user.model";
import { AppointmentModel } from "../../models/appointment.model";
import { AvailabilitySlotModel } from "../../models/availabilityslots.model";
import { generateTimeSlots } from "../../utils/slot.utils";

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
    res.status(429).json({
      message: "For mange beskeder sendt på kort tid. Nulstiller om 20 min.",
    });
    res.status(500).json({ message: "Error" });
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
    console.error("Failed to mark message as read", error);
    res.status(500).json({ message: "Error" });
  }
};

// **************************************************** PATIENT OG LÆGEOPSÆTNING
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

// Dette endpoint viser et overblik over hvor mange tider der er ledige pr læge grupperet per dag
// Valgfri filtrering på doctorId
// Returnerer antal ledige tider grupperet per læge per dag
// Sorter: dato stigende, navn A–Z.
// ét objekt pr læge pr dag: fx:{ doctorName: \"Simon\", date: \"2025-06-01\", availableSlots: 5 }
// giver et overblik over antal ledige tider pr. læge pr. dag
export const getAvailabilityOverview = async (req: Request, res: Response) => {
  try {
    // Læser weekstart (dato for startuge) og doctorId fra URL'en
    const { weekStart, doctorId } = req.query;

    if (!weekStart) {
      res
        .status(400)
        .json({ message: "weekStart is required (e.g. 2025-05-05)" });
      return;
    }

    // Opretter to datoer, start og end date
    const startDate = new Date(weekStart as string); // Konverterer weekStart til en Date-objekt
    const endDate = new Date(startDate);
    //sætter enddate der er 20 dage frem i tid (næsten 3 uger) for at filtrere tiderne (definerer itnervallet vi vil undersøge slots i)
    endDate.setDate(endDate.getDate() + 20);

    // match: mognodb query filter
    // vi vil finde slots som:
    const match: any = {
      date: { $gte: startDate, $lte: endDate }, //har en date som er mellem startDate og endDate
      is_booked: false, //ikke er booket
    };

    // Hvis doctorId er angivet af brugeren - og er gyldig (et objectid) - tilføjer vi det til vores filtered
    // resultat: får kun slots for den læge
    if (doctorId && mongoose.Types.ObjectId.isValid(doctorId as string)) {
      match.doctor_id = new mongoose.Types.ObjectId(doctorId as string);
    }

    if (!weekStart) {
      res
        .status(400)
        .json({ message: "weekStart is required (e.g. 2025-05-05)" });
      return;
    }

    // Hvis der er en doctorId, men den er ugyldig
    if (doctorId && !mongoose.Types.ObjectId.isValid(doctorId as string)) {
      //returner tomt array
      res.status(200).json([]);
      return;
    }

    // Bruger .aggresgate() (mongodbs aggregations pipeline)
    // avanceret forespørgsel i flere trin
    // svarer til GROUP BY i SQL men med mere fleksibilitet
    const slots = await AvailabilitySlotModel.aggregate([
      // Først filtrer vi slots så vi kun arbejder med relevante slots (fra datointervallet og evt lægen)
      // vi har angivet den query længere oppe
      { $match: match },
      // Vi grupperer resultaterne baseret på:
      // hvilken læge det er (doctorId)
      // hvilken dag det er (date)
      // "Læg alle slots sammen, hvor lægen og datoen er den samme"
      {
        $group: {
          _id: {
            doctor_id: "$doctor_id",
            date: "$date",
          },
          // vi tæller hvor mange ledige slots der er
          // → “læg +1 sammen for hvert dokument” → tælling
          availableSlots: { $sum: 1 },
        },
      },
      //$lookup for at hente info om lægen fra users-collectionen og tilføjer det som et felt kaldet doctor, fungerer lidt som JOIN
      {
        // For hver doctor_id gør vi:
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
      // $unwind gør så doctor bliver et enkelt ojbject og ik et array.
      { $unwind: "$doctor" },
      // Vi definerer hvilke felter vi vil have med i resultatet - og omdøber nogle
      // doctor oplysninger, hvornår tiderne er og hvor mange tider
      {
        $project: {
          doctorId: "$doctor._id",
          doctorName: "$doctor.name",
          role: "$doctor.role",
          date: "$_id.date",
          availableSlots: 1, //mongo-way of saying keep this field in the output that we counted from the grouping before, "0" would be remove the field
        },
      },
      // Sorter resultatet: vi vil have datoer i stigende rækkefølge, fx man-fre og navne i alfabetisk orden
      { $sort: { date: 1, doctorName: 1 } },
    ]);

    res.status(200).json(slots);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Fail" });
  }
};

//Dette endpoint returnerer hver enkelt ledig tid (dato + tidspunkt) for en given klinik og (valgfrit) bestemt læge
// et objekt pr slot fx: { doctorName: \"Simon\", date: \"2025-06-01\", start_time: \"08:00\", end_time: \"08:15\" }
// giver hver enkelt eldig tid med klokkeslæt
export const getAvailabilitySlots = async (req: Request, res: Response) => {
  try {
    // trækker clinicid ud fra den authetnitcated bruger
    const clinicId = req.user!.clinicId;
    // trækker weekstart og doctorId fr aURLens query-parametre
    const { weekStart, doctorId } = req.query;

    if (!weekStart) {
      res.status(400).json({ message: "weekStart is required" });
      return;
    }

    // definerer start- og slutdato for søgningen
    const startDate = new Date(weekStart as string);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 20); //en periode på 21 dage (3 uger frem)

    // bygger et match-filter til mongodb
    // vi vil gerne matche tider i databasen baseret på:
    const match: any = {
      clinic_id: clinicId, //kun fra den aktuelle klinik
      date: { $gte: startDate, $lte: endDate }, //kun mellem start- og end date
      is_booked: false, //ledige tider
    };

    // Hvis vi fik doctorId i URL'en og den er gyldig, så filtrerer vi på det også
    //Ellers henter vi slots for alle læger i klinikken
    if (doctorId && mongoose.Types.ObjectId.isValid(doctorId as string)) {
      match.doctor_id = new mongoose.Types.ObjectId(doctorId as string);
    }

    // vi hetner alle tiderne der matcher fra databasen
    const slots = await AvailabilitySlotModel.find(match)
      // populate at få lægens navn med, udover id
      .populate("doctor_id", "name")
      // stigende dato, og inden for samme dag (tidligste tider først) - modsat er -1
      .sort({ date: 1, start_time: 1 });
    // vi får fx:
    // {
    //   _id: "123",
    //   doctor_id: { _id: "456", name: "Mie Christensen" },
    //   date: "2025-06-03",
    //   start_time: "09:00",
    //   end_time: "09:15",
    //   is_booked: false
    // }

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

    // mapper over alle slots (enkelte tider) og formaterer dataen til et enklere og renere format til frontend
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
    res.status(500).json({ message: "Server error" });
  }
};
// **************************************************** AvailabilitySlots Seeding Fallback
// automatisk fallback-logik, som kun seeder availability slots on-demand ved åbning af booking-siden
// men kun hvis der mangler slots for de næste 21 dage
export const checkAndSeedSlots = async (req: Request, res: Response) => {
  try {
    const clinicId = req.user!.clinicId;

    // finder alle læger i den aktuelle klinik, da vi skal generere slots for hver læge
    const doctors = await UserModel.find({
      clinic_id: clinicId,
      role: "doctor",
    });

    if (!doctors.length) {
      res
        .status(404)
        .json({ message: "Ingen læger fundet tilknyttet klinikken." });
      return;
    }

    const today = new Date();
    // sætter today til dags dato kl 00.00 - for at sammenligne slots med i dag og frem
    today.setHours(0, 0, 0, 0);
    const futureDate = new Date(today);
    // laver en futuredate some r 3 uger (21 dage frem i tiden)
    futureDate.setDate(futureDate.getDate() + 20);

    // !!check om der allerede findes slots 20 dage frem
    // finder alle eksisterende slots i den klinik fra i dag til 3 uger frem – om de er booket eller ej
    const existingSlots = await AvailabilitySlotModel.find({
      clinic_id: clinicId,
      date: { $gte: today, $lte: futureDate },
    });

    // laver en set (unik samling) af alle datoer, hvor der allerede findes slots
    const existingDates = new Set(
      // fx ["2025-06-01", "2025-06-02", "2025-06-03", ...]
      existingSlots.map((slot) => slot.date.toISOString().split("T")[0])
    );

    // forbereder nye slots hvis der mangler
    let seededCount = 0;

    interface SlotInput {
      doctor_id: Types.ObjectId;
      clinic_id: Types.ObjectId;
      date: Date;
      start_time: string;
      end_time: string;
      is_booked: boolean;
    }
    // opretter en tom array til nye slots der skal insertes
    const slotsToInsert: SlotInput[] = [];

    // loop over hver dag de næste 21 dage
    for (let i = 0; i < 21; i++) {
      const date = new Date(today);
      // Vi går dag for dag fra i dag og 21 dage frem
      date.setDate(date.getDate() + i);
      // isoDate er datoen som string (fx "2025-06-01")
      const isoDate = date.toISOString().split("T")[0];

      // Skip hvis datoen allerede har slots, for at undgå doubleseeding
      if (existingDates.has(isoDate)) continue;

      // Skip hvis det er weekend
      // springer lørdage (6) og søndage (0) over..
      const isWeekend = date.getDay() === 6 || date.getDay() === 0;
      if (isWeekend) continue;

      // generer tider for hver læge for denne dag
      for (const doctor of doctors) {
        // util funktion der opretter timeslots
        for (const { start, end } of generateTimeSlots()) {
          slotsToInsert.push({
            doctor_id: doctor._id as mongoose.Types.ObjectId,
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
      res.status(201).json({
        message: "Seeded nye tider.",
        count: slotsToInsert.length,
      });
      return;
    } else {
      console.log(
        "Slots dækker allerede 3 uger frem – ingen seeding nødvendig."
      );
      res.status(200).json({
        message: "Allerede opdateret. Ingen grund til at seede.",
      });
      return;
    }
  } catch (error) {
    console.error("Fejl under check-and-seed:", error);
    res.status(500).json({ message: "Serverfejl" });
  }
};

// **************************************************** Booking og notering
export const createAppointment = async (req: Request, res: Response) => {
  try {
    const { patient_id, doctor_id, slot_id } = req.body;
    const clinicId = req.user!.clinicId;

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
    res.status(500).json({ message: "Error" });
  }
};

export const addSymptomNote = async (req: Request, res: Response) => {
  try {
    const appointmentId = req.params.id;
    const { note } = req.body;

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
    console.error(error);
    res.status(500).json({ message: "Error" });
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
    console.error(error);
    res.status(500).json({ message: "Failed" });
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

    // Sorter og begræns til de 6 nyeste
    const sorted = filtered
      .sort((a, b) => {
        if (a.date.getTime() !== b.date.getTime()) {
          return b.date.getTime() - a.date.getTime(); // nyeste dato først, selvom de alle er i dag, men for en sikkerhedsskyld
        }
        return b.time.localeCompare(a.time); // nyeste tid først (efter tjekket dato)
      })
      .slice(0, 6); //derefter begrænser vi til de 6 nyeste

    res.status(200).json(sorted);
  } catch (error) {
    console.error("Error fetching past appointments:", error);
    res.status(500).json({ message: "Failed" });
  }
};
