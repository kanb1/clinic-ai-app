import { IPopulatedUser } from "./IPopulatedUser";

export interface IPopulatedMessage {
  _id: string;
  sender_id: IPopulatedUser;
  receiver_id: IPopulatedUser | "all";
  receiver_scope: "all" | "staff" | "patients" | "individual";
  content: string;
  type: "besked" | "system" | "aflysning";
  read: boolean;
  createdAt: string;
}
