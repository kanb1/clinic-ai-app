import Navbar from "@/components/layout/NavBar";
import { RouteObject } from "react-router-dom";
import DoctorDashboard from "@/pages/Doctor/DoctorDashboard";
import RequireRole from "./RequireRole";

export const doctorRoutes: RouteObject[] = [
  {
    element: (
      <RequireRole allowedRoles={["doctor"]}>
        <Navbar />
      </RequireRole>
    ),
    children: [
      {
        path: "dashboard",
        element: <DoctorDashboard />,
      },
    ],
  },
];
