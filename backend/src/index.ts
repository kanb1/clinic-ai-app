import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import { connectDB } from "./config/db";
// Routes
import authRoutes from "./routes/auth.routes";
import clinicRoutes from "./routes/clinic.routes";
import userRoutes from "./routes/user.routes";
import adminRoutes from "./routes/admin.routes";
import patientRoutes from "./routes/patient.routes";

import "./middleware/authenticateJWT.middleware";
import secretaryRoutes from "./routes/secretary.routes";
import doctorRoutes from "./routes/doctor.routes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 10000;

// MongoDB connection
// Hvis env ik er "test", så connect - inde i package.json har vi sat jest testenv. til at være "test", hvor deer ik bliver connected
if (process.env.NODE_ENV !== "test") {
  connectDB();
}

const allowedOrigins = [
  // for development
  "http://localhost:5173",
  // production
  "https://clinic-ai-app.vercel.app",
];

app.use(
  cors({
    origin: allowedOrigins,
  })
);

app.use(helmet());
app.use(express.json());

// Routes - Fundament
app.use("/api/auth", authRoutes);
app.use("/api/clinics", clinicRoutes);
app.use("/api/users", userRoutes);
// Routes - Admin
app.use("/api/admin", adminRoutes);
// Routes - Secretary
app.use("/api/secretary", secretaryRoutes);
// Routes - Doctor
app.use("/api/doctors", doctorRoutes);

// Routes - Patient
app.use("/api/patients", patientRoutes);

// Needed for the integrationtests with supertest
export default app;

//Express-serveren skal kun kaldes under et ikke-test-miljø
if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(` Server is running at http://localhost:${PORT}`);
  });
}
