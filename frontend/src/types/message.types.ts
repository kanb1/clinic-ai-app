export interface IMessage {
  _id: string;
  sender_id: {
    _id: string;
    name: string;
    role: string;
    clinic_id: string;
  };
  receiver_id: string | { _id: string };
  receiver_scope: "all" | "patients" | "individual";
  content: string;
  type: "besked" | "system" | "aflysning";
  read: boolean;
  createdAt: string;
}
