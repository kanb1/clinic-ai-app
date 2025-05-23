export interface IUser {
  // svarer til _id i backend
  id: string;
  name: string;
  email: string;
  role: "admin" | "doctor" | "secretary" | "patient";
  clinic_id: string;
  status: "ledig" | "optaget" | "fri";
}
