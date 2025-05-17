import Navbar from "@/components/layout/NavBar";
import { RouteObject } from "react-router-dom";
import DoctorDashboard from "@/pages/Doctor/DoctorDashboard";

export const doctorRoutes: RouteObject[] = [
  {
    element: <Navbar />,
    children: [{ path: "dashboard", element: <DoctorDashboard /> }],
  },
];
