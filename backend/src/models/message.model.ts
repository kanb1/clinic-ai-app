import mongoose, { Schema, Document } from "mongoose";

export interface IMessage extends Document {
  sender_id: mongoose.Types.ObjectId;
  receiver_id: mongoose.Types.ObjectId | "all";
  receiver_scope: "all" | "staff" | "patients" | "individual";
  content: string;
  read: boolean;
  type: "besked" | "aflysning" | "system";
  createdAt: Date;
}

const MessageSchema: Schema = new Schema(
  {
    sender_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiver_id: {
      type: mongoose.Schema.Types.Mixed, // tillader både ObjectId og string ("all")
      required: false, //ikke required globalt, men validerer i selve controller hvis scope er indiivudel
    },
    receiver_scope: {
      type: String,
      enum: ["all", "staff", "patients", "individual"],
      required: true,
      default: "individual",
    },
    type: {
      type: String,
      enum: ["besked", "system", "aflysning"],
      required: true,
    },
    content: { type: String, required: true },
    read: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: true, updatedAt: false } } // kun createdAt
);

export const MessageModel = mongoose.model<IMessage>("Message", MessageSchema);
