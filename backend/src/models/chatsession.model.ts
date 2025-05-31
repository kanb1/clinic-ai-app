import mongoose, { Schema, Document } from "mongoose";

export interface IChatSession extends Document {
  patient_id: mongoose.Types.ObjectId;
  messages: { user: string; ai: string }[];
  saved_to_appointment_id?: mongoose.Types.ObjectId; // Hvis brugeren gemmer chat på en aftale
}

const ChatSessionSchema: Schema = new Schema(
  {
    patient_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    messages: [
      //object instead of an array
      {
        user: { type: String },
        ai: { type: String },
      },
    ],
    saved_to_appointment_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
    },
  },
  { timestamps: true }
);

export const ChatSessionModel = mongoose.model<IChatSession>(
  "ChatSession",
  ChatSessionSchema
);
