import { useMutation } from "@tanstack/react-query";
import { api } from "../../services/httpClient";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export const useLogin = (onRoleError?: (role: string) => void) => {
  // REACT QUERY: Bruges til at ændre data (POST/PUT/DELETE) og holder styr på alt dette samtidig:
  // mutate -> (function) når jeg vil sende data, bliver brugt i pagen fx handleSubmit, POST fx login
  // isPending -> (boolean) der fortæller er mutation i gang lige nu?
  // isError -> Er der sket en fejl (boolean)
  // Cacher automatisk

  const navigate = useNavigate();
  const { setUser, setToken } = useAuth(); // bruger AuthContext til at gemme login-data

  return useMutation({
    // mutationFn: hovedfunktionen som kører når vi kalder mutate
    // modtager data: email og password her
    // hvad skal der ske når brugeren prøver logge ind?

    mutationFn: async (data: { email: string; password: string }) => {
      // sender login-info til backend
      const response = await api.post("/auth/login", data);
      // returnerer det bakend sender tilbage: { token, user }
      return response.data;
    },
    // onSuccess -> Kører auto hvis mutationFn lykkedes
    onSuccess: (data) => {
      setToken(data.token); // gem JWT-token globalt
      setUser(data.user); // gem brugerinfo globalt

      // Modtager en callback onRoleError
      // Hvis brugeren er patient og forsøger at logge ind via /staff/login bliver login stoppet og callback’en kaldt med rollen
      const role = data.user.role;
      if (window.location.pathname === "/staff/login" && role === "patient") {
        // Her bliver funktionen jeg gav aktiveret
        onRoleError?.(role);
        return;
      }

      // Redirect baseret på rolle
      switch (role) {
        case "admin":
          navigate("/admin/dashboard");
          break;
        case "doctor":
          navigate("/doctor/dashboard");
          break;
        case "secretary":
          navigate("/secretary/dashboard");
          break;
        case "patient":
          navigate("/patient/dashboard");
          break;
        default:
          navigate("/");
      }
    },
    onError: (error) => {
      console.error("Login failed:", error);
    },
  });
};
