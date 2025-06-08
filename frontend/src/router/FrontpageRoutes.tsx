import { RouteObject } from "react-router-dom";
import ChooseRolePage from "../pages/Frontpage/ChooseRolePage";
import ClinicAuthPage from "../pages/Frontpage/ClinicAuthPage";
import PatientLoginPage from "../pages/Frontpage/PatientLoginPage";
import StaffLoginPage from "../pages/Frontpage/StaffLoginPage";
import CreateClinicPage from "../pages/Frontpage/CreateClinicPage";
import Navbar from "@/components/layout/NavBar";
import HelpPage from "@/pages/Frontpage/HelpPage";

// I større apps som min er det bedre at strukturere ruterne som objekter i arrays i stedet for at dele routes op i filer og genbruge layouts som Navbar uden gentagelser
export const frontpageRoutes: RouteObject[] = [
  {
    // Fælles UI for alle child routes
    element: <Navbar />,
    // definerer alle de sider som skal vises under Navbar
    // svarer til den "originale" metode, men med objekter i stedet for jsx (<Route path="x" element../>)
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
