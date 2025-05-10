import { IPopulatedUser } from "./IPopulatedUser";

export interface IPopulatedMessage {
  _id: string;
  sender_id: IPopulatedUser;
  receiver_id: IPopulatedUser | "all";
  content: string;
  type: "besked" | "system" | "aflysning";
  read: boolean;
  createdAt: string;
}
