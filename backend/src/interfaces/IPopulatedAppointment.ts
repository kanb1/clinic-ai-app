import { IAppointment } from "../models/appointment.model";
import { IUser } from "../models/user.model";

// patient_id er allerede populated heri og følger dermed IUser strukturen
// hjælper TS i doc-controlleren med at forstå at patient_id ikke bar eer et id men et objekt med felter som name og birth_date
export type IPopulatedAppointment = IAppointment & {
  patient_id: IUser;
};
