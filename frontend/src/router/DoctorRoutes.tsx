import Navbar from "@/components/layout/NavBar";
import { RouteObject } from "react-router-dom";
// import DoctorDashboard from "@/pages/Doctor/DoctorDashboard";
import RequireRole from "./RequireRole";
import TodaysAppointmentsPage from "@/pages/Doctor/TodaysAppointmentsPage";
import JournalOverviewPage from "@/pages/Doctor/PatientOverviewPage";
import JournalDetailsPage from "@/pages/Doctor/PatientJournalPage.tsx";
import PatientJournalPage from "@/pages/Doctor/PatientJournalPage.tsx";
import PatientOverviewPage from "@/pages/Doctor/PatientOverviewPage";

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
        // element: <DoctorDashboard />,
      },
      {
        path: "appointments",
        element: <TodaysAppointmentsPage />,
      },
      {
        path: "patients",
        element: <PatientOverviewPage />,
      },
      {
        path: "patient-journal",
        element: <PatientJournalPage />,
      },
    ],
  },
];
