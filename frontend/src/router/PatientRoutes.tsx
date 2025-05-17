import PatientDashboard from "@/pages/Patient/PatientDashboard";
import Navbar from "@/components/layout/NavBar";
import { RouteObject } from "react-router-dom";

export const patientRoutes: RouteObject[] = [
  {
    element: <Navbar />,
    children: [{ path: "dashboard", element: <PatientDashboard /> }],
  },
];
