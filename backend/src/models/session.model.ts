// til at tracke jti
import mongoose from "mongoose";

const SessionSchema = new mongoose.Schema(
  {
    jti: { type: String, required: true, unique: true },
    createdAt: { type: Date, default: Date.now, expires: "1d" }, // auto slettes efter 1 dag
  },
  { timestamps: true }
);

export const SessionModel = mongoose.model("Session", SessionSchema);
