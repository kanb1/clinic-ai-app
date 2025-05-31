export interface IUser {
  birth_date: Date;
  _id: string; // Brugt i hele frontend
  id?: string; // Evt. fallback fra backend
  name: string;
  email: string;
  role: "admin" | "doctor" | "secretary" | "patient";
  clinic_id: string;
  status: "ledig" | "optaget" | "fri";
  phone?: string;
  address?: string;
  cpr_number: string;
}
