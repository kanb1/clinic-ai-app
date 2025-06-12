import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "";

export const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 30000, // 30 sekunder til at finde en server
      connectTimeoutMS: 30000, // 30 sekunder til at etablere forbindelse
    });
    console.log("You are connected to MongoDB");
  } catch (error) {
    console.error("Failed to connect with MongoDB", error);
    process.exit(1);
  }
};
