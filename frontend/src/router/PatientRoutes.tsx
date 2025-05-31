import Navbar from "@/components/layout/NavBar";
import { RouteObject } from "react-router-dom";
import RequireRole from "./RequireRole";
import PatientFrontpage from "@/pages/Patient/PatientFrontpage";

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
    ],
  },
];
