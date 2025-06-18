import { RouteObject } from "react-router-dom";
import RequireRole from "./RequireRole";
import Navbar from "@/components/layout/NavBar";
import AdminFrontpage from "@/pages/Admin/AdminFrontpage";
import AdminPatientPage from "@/pages/Admin/AdminPatientPage";
import AdminStaffPage from "@/pages/Admin/AdminDoctorPage";
import AdminDoctorPage from "@/pages/Admin/AdminDoctorPage";
import AdminSecretaryPage from "@/pages/Admin/AdminSecretaryPage";
import AdminSendMessagePage from "@/pages/Admin/AdminSendMessagePage";

// route-object -> match route-object typen
export const adminRoutes: RouteObject[] = [
  {
    // dette bliver rendered først -> root-level element
    element: (
      // requirerole: tjekker brguerens rolle fra authcontext
      // beskytter Navbar og Outlet som bliver rendered i layoutkomponent Navbar.tsx
      <RequireRole allowedRoles={["admin"]}>
        <Navbar />
      </RequireRole>
    ),
    // children bliver rendered som Outlet indeni element
    // <Outlet/>:
    children: [
      {
        path: "frontpage",
        element: <AdminFrontpage />,
      },
      {
        path: "patients",
        element: <AdminPatientPage />,
      },
      {
        path: "doctors",
        element: <AdminDoctorPage />,
      },
      {
        path: "secretaries",
        element: <AdminSecretaryPage />,
      },
      {
        path: "send-message",
        element: <AdminSendMessagePage />,
      },
    ],
  },
];
