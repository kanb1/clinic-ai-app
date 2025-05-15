import TestStyle from "./pages/TestStyle";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import AdminRoutes from "../src/router/AdminRoutes";
// import PatientRoutes from "../src/router/PatientRoutes";
// import DoctorRoutes from "../src/router/DoctorRoutes";
// import SecretaryRoutes from "../src/router/SecretaryRoutes";
// import AuthRoutes from "./router/FrontpageRoutes/AuthRoutes";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/teststyle" element={<TestStyle />} />
      </Routes>
    </Router>
  );
}

export default App;
