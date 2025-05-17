import Navbar from "@/components/layout/NavBar";
import { RouteObject } from "react-router-dom";
import AdminDashboard from "@/pages/Admin/AdminDashboard";

export const adminRoutes: RouteObject[] = [
  {
    element: <Navbar />,
    children: [{ path: "dashboard", element: <AdminDashboard /> }],
  },
];
