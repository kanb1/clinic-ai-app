// IUser.ts              ← export interface IUser
//IPopulatedUser.ts     ← udvidet med `clinic_id`, `name` osv. Fordelen i dette er at jeg Importerer typer uden at importere hele mongoose filen
export interface IPopulatedUser {
  _id: string;
  name: string;
  role: "admin" | "doctor" | "secretary" | "patient";
  clinic_id: string;
}
