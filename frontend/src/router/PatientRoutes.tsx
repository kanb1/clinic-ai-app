import Navbar from "@/components/layout/NavBar";
import { RouteObject } from "react-router-dom";
import RequireRole from "./RequireRole";
import PatientFrontpage from "@/pages/Patient/PatientFrontpage";
import PatientMyAppointments from "@/pages/Patient/PatientMyAppointments";
import AIChatPage from "@/pages/Patient/AIChatPage";
import PatientSettings from "@/pages/Patient/PatientSettings";

export const patientRoutes: RouteObject[] = [
  {
    element: (
      <RequireRole allowedRoles={["patient"]}>
        <Navbar />
      </RequireRole>
    ),
    children: [
      {
        path: "frontpage",
        element: <PatientFrontpage />,
      },
      {
        path: "appointments",
        element: <PatientMyAppointments />,
      },
      {
        path: "ai",
        element: <AIChatPage />,
      },
      {
        path: "settings",
        element: <PatientSettings />,
      },
    ],
  },
];
