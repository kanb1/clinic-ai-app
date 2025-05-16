import TestStyle from "./pages/TestStyle";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import FrontpageRoutes from "./router/FrontpageRoutes";
// import AdminRoutes from "../src/router/AdminRoutes";
// import PatientRoutes from "../src/router/PatientRoutes";
// import DoctorRoutes from "../src/router/DoctorRoutes";
// import SecretaryRoutes from "../src/router/SecretaryRoutes";

function App() {
  return (
    <Router>
      <FrontpageRoutes />

      <Routes>
        {/* Theme testing page */}
        <Route path="/teststyle" element={<TestStyle />} />
      </Routes>
    </Router>
  );
}

export default App;
