import Navbar from "@/components/layout/NavBar";
import { RouteObject } from "react-router-dom";
import RequireRole from "./RequireRole";
import PatientDashboard from "@/pages/Patient/PatientDashboard";

export const patientRoutes: RouteObject[] = [
  {
    element: (
      <RequireRole allowedRoles={["patient"]}>
        <Navbar />
      </RequireRole>
    ),
    children: [
      {
        path: "dashboard",
        element: <PatientDashboard />,
      },
    ],
  },
];
