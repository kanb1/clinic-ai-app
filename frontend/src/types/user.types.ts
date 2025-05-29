export interface IUser {
  birth_date: Date;
  _id: string;
  id: string; // svarer til _id i backend
  name: string;
  email: string;
  role: "admin" | "doctor" | "secretary" | "patient";
  clinic_id: string;
  status: "ledig" | "optaget" | "fri";
  phone?: string;
  address?: string;
  cpr_number: string;
}
