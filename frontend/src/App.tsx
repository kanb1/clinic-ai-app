// src/App.tsx
import { useRoutes } from "react-router-dom";
import { frontpageRoutes } from "./router/FrontpageRoutes";
import { patientRoutes } from "./router/PatientRoutes"; // Husk at lave denne om også!
import TestStyle from "./pages/TestStyle";
import { adminRoutes } from "./router/AdminRoutes";
import { doctorRoutes } from "./router/DoctorRoutes";
import { secretaryRoutes } from "./router/SecretaryRoutes";

// bruger useRoutes til at læse hele min route struktur
const App = () => {
  // routeobject[] array som automatisk laver samme struktur som den originate <Routes><Route ... /></Routes>
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

  return routes;
};

export default App;
