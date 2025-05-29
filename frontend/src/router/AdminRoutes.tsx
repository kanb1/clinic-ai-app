import { RouteObject } from "react-router-dom";
import RequireRole from "./RequireRole";
import Navbar from "@/components/layout/NavBar";
import AdminFrontpage from "@/pages/Admin/AdminFrontpage";

export const adminRoutes: RouteObject[] = [
  {
    element: (
      // alt der ligger under denne elemnt (children) skal først passere requireRole
      // react router tjekker først element og vil vise den altså requirerole + navbar -> Requirerole tjekker brugerens rolle -> hvis godkendt -> viser navbar og går videre til children
      // jeg sætter den højere oppe i hierarkiet her nemlig
      <RequireRole allowedRoles={["admin"]}>
        <Navbar />
      </RequireRole>
    ),
    children: [
      {
        path: "frontpage",
        element: <AdminFrontpage />,
      },
    ],
  },
];
