import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pingRoutes from "./routes/ping.routes";
import { connectDB } from "./config/db";
// Routes
import authRoutes from "./routes/auth.routes";
import clinicRoutes from "./routes/clinic.routes";
import userRoutes from "./routes/user.routes";
import adminRoutes from "./routes/admin.routes";
import patientRoutes from "./routes/patient.routes";

import "./middleware/authenticateJWT.middleware";
import secretaryRoutes from "./routes/secretary.routes";
import availabilityslotsRoutes from "./routes/availabilityslots.routes";
import doctorRoutes from "./routes/doctor.routes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// MongoDB connection
connectDB();

app.use(cors());
app.use(express.json());

// Example route
app.use("/api/ping", pingRoutes);

// Routes - Fundament
app.use("/api/auth", authRoutes);
app.use("/api/clinics", clinicRoutes);
app.use("/api/users", userRoutes);
// Routes - Admin
app.use("/api/admin", adminRoutes);
// Routes - Secretary
app.use("/api/secretary", secretaryRoutes);
app.use("/api/availabilityslots", availabilityslotsRoutes);
// Routes - Doctor
app.use("/api/doctors", doctorRoutes);
// Routes - Patient
app.use("/api/patients", patientRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Server is running at http://localhost:${PORT}`);
});
