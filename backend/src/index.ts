import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pingRoutes from "./routes/ping.routes";
import { connectDB } from "./config/db";
// Routes
import authRoutes from "./routes/auth.routes";
import clinicRoutes from "./routes/clinic.routes";
import "./middleware/authenticateJWT.middleware";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// MongoDB connection
connectDB();

app.use(cors());
app.use(express.json());

// Example route
app.use("/api/ping", pingRoutes);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/clinics", clinicRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Server is running at http://localhost:${PORT}`);
});
