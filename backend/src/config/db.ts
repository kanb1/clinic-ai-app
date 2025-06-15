// forbindelsen til min mongodb
import mongoose from "mongoose";
import dotenv from "dotenv";

// indlæs env -> mango_uri
dotenv.config();

// gemmer mango_uri i variabel
const MONGO_URI = process.env.MONGO_URI || "";

// forsøger at forbinde til db -> bruges i index.ts
export const connectDB = async () => {
  // try -> hvis fejl -> vi håndterer det
  try {
    // mongoose forbindelse til min db
    await mongoose.connect(MONGO_URI, {
      // 30 sekunder til at finde en server
      serverSelectionTimeoutMS: 30000,
      // 30 sekunder til at etablere forbindelse
      connectTimeoutMS: 30000,
      // ^ render var lidt langsom om forbindelsen -> ekstra tålmodighed
    });
    console.log("You are connected to MongoDB");
  } catch (error) {
    console.error("Failed to connect with MongoDB", error);
    // fejlkode 1 -> noget gik galt -> lukker programmet
    // vil ik lade server køre uden db
    process.exit(1);
  }
};
