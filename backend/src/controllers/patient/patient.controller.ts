import { Request, Response } from 'express';
import { UserModel } from '../../models/user.model';
import crypto from 'crypto';

//************************************************* */ GET ALL PATIENTS
export const getPatients = async (req: Request, res: Response) => {
  try {
    const clinicId = req.user!.clinicId;

    const patients = await UserModel.find({
      role: 'patient',
      clinic_id: clinicId,
    }).select('-password_hash');

    res.status(200).json(patients);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch patients', error });
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
    }).select('-password_hash');

    if (existing) {
      res.status(200).json({
        message: 'Patient found',
        patient: existing,
        patientWasFoundBefore: true,
      });
      return;
    }

    // Generérer sikkert tilfældigt password, så feltet ik er blankt/usikkert
    const randomPassword = crypto.randomBytes(16).toString('hex');

    // Opretter dummy data som senere kan redigeres m. modal
    const newPatient = await UserModel.create({
      name: 'Ukendt Patient',
      email: `${cpr}@dummy.dk`,
      password_hash: randomPassword,
      role: 'patient',
      cpr_number: cpr,
      clinic_id: clinicId,
      status: 'ledig',
    });

    // Konverterer Mongoose-dokument til almindeligt objekt, og fjerner password_hash fra det, til når vi returnerer til frontend.
    const patientToReturn = newPatient.toObject();

    // object destructuring -> tag pass_hash ud og safePatient indeholder resten af felterne
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password_hash, ...safePatient } = patientToReturn;
    // ^ESLINT IGNORE! det er for at fjerne linting fejl ved password_hash, da jeg ved at den ikke bliver brugt, men linting kræver det bruges. Hvis jeg bruger delete pass_hash i stedet for object destructuring så får vi ts fejl. Så det er for også at fikse den fejl

    res.status(201).json({
      message: 'Patient not found. Dummy patient created.',
      patient: safePatient,
      patientWasFoundBefore: false,
    });
    return;
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error during CPR lookup', error });
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
    if (!patient || patient.role !== 'patient') {
      res.status(404).json({ message: 'C ould not find patient' });
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
      message: 'Patient info got successfully updated',
      patient,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error when updating patient', error });
  }
};

// ************************************************* */ DELETE PATIENTS
export const deletePatient = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const deleted = await UserModel.findOneAndDelete({
      _id: id,
      role: 'patient',
      clinic_id: req.user!.clinicId, // sikkerhed: kun slet hvis patient hører til din klinik
    });

    if (!deleted) {
      res.status(404).json({ message: 'Patient not found' });
      return;
    }

    res.status(200).json({ message: 'Patient deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error deleting patient', error });
  }
};
