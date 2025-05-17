import Navbar from "@/components/layout/NavBar";
import { RouteObject } from "react-router-dom";
import SecretaryDashboard from "@/pages/Secretary/SecretaryDashboard";

export const secretaryRoutes: RouteObject[] = [
  {
    element: <Navbar />,
    children: [{ path: "dashboard", element: <SecretaryDashboard /> }],
  },
];
