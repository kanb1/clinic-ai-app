import { useRoutes } from "react-router-dom";
import { frontpageRoutes } from "./router/FrontpageRoutes";
import { patientRoutes } from "./router/PatientRoutes";
import TestStyle from "./pages/TestStyle";
import { adminRoutes } from "./router/AdminRoutes";
import { doctorRoutes } from "./router/DoctorRoutes";
import { secretaryRoutes } from "./router/SecretaryRoutes";

const App = () => {
  //motoren af all min routin i min app er <BrowserRouter> i main.tsx
  const routes = useRoutes([
    ...frontpageRoutes,
    {
      path: "/patient",
      children: patientRoutes,
    },
    {
      path: "/admin",
      children: adminRoutes,
    },
    {
      path: "/doctor",
      children: doctorRoutes,
    },
    {
      path: "/secretary",
      children: secretaryRoutes,
    },
    {
      path: "/teststyle",
      element: <TestStyle />,
    },
  ]);

  return <>{routes}</>;
};

export default App;
