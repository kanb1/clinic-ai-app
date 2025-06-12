import { RouteObject } from "react-router-dom";
import ChooseRolePage from "../pages/Frontpage/ChooseRolePage";
import ClinicAuthPage from "../pages/Frontpage/ClinicAuthPage";
import PatientLoginPage from "../pages/Frontpage/PatientLoginPage";
import StaffLoginPage from "../pages/Frontpage/StaffLoginPage";
import CreateClinicPage from "../pages/Frontpage/CreateClinicPage";
import Navbar from "@/components/layout/NavBar";
import HelpPage from "@/pages/Frontpage/HelpPage";

export const frontpageRoutes: RouteObject[] = [
  {
    // Fælles UI for alle child routes
    element: <Navbar />,

    children: [
      { path: "/", element: <ChooseRolePage /> },
      { path: "/clinic/auth", element: <ClinicAuthPage /> },
      { path: "/patient/login", element: <PatientLoginPage /> },
      { path: "/staff/login", element: <StaffLoginPage /> },
      { path: "/createclinic", element: <CreateClinicPage /> },
      { path: "/help", element: <HelpPage /> },
    ],
  },
];
