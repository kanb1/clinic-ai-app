import Navbar from "@/components/layout/NavBar";
import { RouteObject } from "react-router-dom";
import RequireRole from "./RequireRole";
import SecretaryDashboard from "@/pages/Secretary/SecretaryDashboard";
import MessagePage from "@/pages/Secretary/MessagePage";
import BookingPage from "@/pages/Secretary/BookAppointmentPage";
import SecretarySettingsPage from "@/pages/Secretary/SecretarySettingsPage";

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
      {
        path: "messages/new",
        element: <MessagePage />,
      },
      {
        path: "appointments/new",
        element: <BookingPage />,
      },
      {
        path: "settings",
        element: <SecretarySettingsPage />,
      },
    ],
  },
];
