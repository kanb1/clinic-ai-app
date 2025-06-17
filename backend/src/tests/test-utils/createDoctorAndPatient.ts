// til journal forholdene (en læge og en patient)
import { createDoctorWithToken } from "./createDoctorWithToken";
import { createPatientWithToken } from "./createPatientWithToken";
import mongoose from "mongoose";

// funktionen returnerer et objekt som Promise
// doctorToken -> JWT til API-kald som læge
// clinicId: både patient og doc tilhører her
export const createDoctorAndPatient = async (): Promise<{
  doctorToken: string;
  doctorId: mongoose.Types.ObjectId;
  patientToken: string;
  patientId: mongoose.Types.ObjectId;
  clinicId: mongoose.Types.ObjectId;
}> => {
  // kalder createDoct.. utils funktionen -> udtrækker resultatet
  // destruction
  const {
    doctor,
    token: doctorToken,
    clinicId,
  } = await createDoctorWithToken();

  const { patient, token: patientToken } = await createPatientWithToken();

  // returnerer objekt med det nøvendige til test
  return {
    doctorToken,
    doctorId: doctor._id as mongoose.Types.ObjectId,
    patientToken,
    patientId: patient._id as mongoose.Types.ObjectId,
    clinicId,
  };
};
