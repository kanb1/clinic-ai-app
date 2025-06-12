import { RouteObject } from "react-router-dom";
import RequireRole from "./RequireRole";
import Navbar from "@/components/layout/NavBar";
import AdminFrontpage from "@/pages/Admin/AdminFrontpage";
import AdminPatientPage from "@/pages/Admin/AdminPatientPage";
import AdminStaffPage from "@/pages/Admin/AdminDoctorPage";
import AdminDoctorPage from "@/pages/Admin/AdminDoctorPage";
import AdminSecretaryPage from "@/pages/Admin/AdminSecretaryPage";
import AdminSendMessagePage from "@/pages/Admin/AdminSendMessagePage";

export const adminRoutes: RouteObject[] = [
  {
    element: (
      <RequireRole allowedRoles={["admin"]}>
        <Navbar />
      </RequireRole>
    ),
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
