// src/router/FrontpageRoutes.tsx
import { Routes, Route, Outlet, useNavigate } from "react-router-dom";
import ChooseRolePage from "../pages/Frontpage/ChooseRolePage";
import ClinicAuthPage from "../pages/Frontpage/ClinicAuthPage";
import PatientLoginPage from "../pages/Frontpage/PatientLoginPage";
import StaffLoginPage from "../pages/Frontpage/StaffLoginPage";
import CreateClinicPage from "../pages/Frontpage/CreateClinicPage";

import Navbar from "@/components/layout/NavBar";
import { Box } from "@chakra-ui/react";

const FrontpageRoutes = () => {
  return (
    <Box minH="100vh">
      <Routes>
        <Route element={<Navbar />}>
          <Route path="/" element={<ChooseRolePage />} />
          <Route path="/clinic/auth" element={<ClinicAuthPage />} />
          <Route path="/patient/login" element={<PatientLoginPage />} />
          <Route path="/staff/login" element={<StaffLoginPage />} />
          <Route path="/createclinic" element={<CreateClinicPage />} />
        </Route>
      </Routes>
    </Box>
  );
};

export default FrontpageRoutes;
