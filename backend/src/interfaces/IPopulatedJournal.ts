import { IJournal } from "../models/journal.model";
import { IUser } from "../models/user.model";

export type IPopulatedJournal = IJournal & {
  patient_id: IUser;
};
