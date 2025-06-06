// til journal forholdene (en læge og en patient)
import { createDoctorWithToken } from "./createDoctorWithToken";
import { createPatientWithToken } from "./createPatientWithToken";
import mongoose from "mongoose";
export const createDoctorAndPatient = async (): Promise<{
  doctorToken: string;
  doctorId: mongoose.Types.ObjectId;
  patientToken: string;
  patientId: mongoose.Types.ObjectId;
  clinicId: mongoose.Types.ObjectId;
}> => {
  const {
    doctor, // indeholder ._id
    token: doctorToken,
    clinicId,
  } = await createDoctorWithToken();

  const {
    patient, //indeholder ._id
    token: patientToken,
  } = await createPatientWithToken();

  return {
    doctorToken,
    doctorId: doctor._id as mongoose.Types.ObjectId,
    patientToken,
    patientId: patient._id as mongoose.Types.ObjectId,
    clinicId,
  };
};
