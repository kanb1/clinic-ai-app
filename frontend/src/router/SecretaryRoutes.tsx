import Navbar from "@/components/layout/NavBar";
import { RouteObject } from "react-router-dom";
import RequireRole from "./RequireRole";
import SecretaryDashboard from "@/pages/Secretary/SecretaryDashboard";

export const secretaryRoutes: RouteObject[] = [
  {
    element: (
      <RequireRole allowedRoles={["secretary"]}>
        <Navbar />
      </RequireRole>
    ),
    children: [
      {
        path: "dashboard",
        element: <SecretaryDashboard />,
      },
    ],
  },
];
