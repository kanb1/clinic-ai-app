import { useRoutes } from "react-router-dom";
import { frontpageRoutes } from "./router/FrontpageRoutes";
import { patientRoutes } from "./router/PatientRoutes";
import TestStyle from "./pages/TestStyle";
import { adminRoutes } from "./router/AdminRoutes";
import { doctorRoutes } from "./router/DoctorRoutes";
import { secretaryRoutes } from "./router/SecretaryRoutes";

//motoren af all min routin i min app er <BrowserRouter> i main.tsx

const App = () => {
  // useRoutes -> "route switch motor"
  // giver den et array af route-objekter
  // sammensat og organiseret efter roller
  const routes = useRoutes([
    // spread array ud -> insæt hvert enkelt route-objekt direkte ind i dette array
    // ønsker /login, /help osv for sig selv og ik under slug "/frontpage"
    ...frontpageRoutes,
    {
      path: "/patient",
      children: patientRoutes, //defineret nested routes her
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

  // returnerer den rigtige komponent -> baseret på window.location.pathname
  return <>{routes}</>;
};

export default App;
