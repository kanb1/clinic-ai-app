import { Routes, Route } from "react-router-dom";
import ChooseRolePage from "../pages/Frontpage/ChooseRolePage";
import ClinicAuthPage from "../pages/Frontpage/ClinicAuthPage";
import PatientLoginPage from "@/pages/Frontpage/PatientLoginPage";

const FrontpageRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<ChooseRolePage />} />
      <Route path="/clinic/auth" element={<ClinicAuthPage />} />
      <Route path="/patient/login" element={<PatientLoginPage />} />
    </Routes>
  );
};

export default FrontpageRoutes;
