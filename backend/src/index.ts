import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pingRoutes from "./routes/ping.routes";
import { connectDB } from "./config/db";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// MongoDB connection
connectDB();

app.use(cors());
app.use(express.json());

// Example
app.use("/api/ping", pingRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Server is running at http://localhost:${PORT}`);
});
