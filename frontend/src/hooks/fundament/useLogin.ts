import { useMutation } from "@tanstack/react-query";
import { api } from "../../services/httpClient";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@chakra-ui/react";

export const useLogin = (
  onRoleError?: (role: string) => void,
  options?: { disableRedirect?: boolean }
) => {
  const navigate = useNavigate();
  const { setUser, setToken } = useAuth();
  const toast = useToast();

  return useMutation({
    mutationFn: async (data: { email: string; password: string }) => {
      const response = await api.post("/auth/login", data);
      return response.data;
    },
    onSuccess: (data) => {
      setToken(data.token); // gem JWT-token globalt
      setUser(data.user); // gem brugerinfo globalt

      const role = data.user.role;

      // Hvis patient prøver at logge ind via /staff/login → afvis
      if (window.location.pathname === "/staff/login" && role === "patient") {
        onRoleError?.(role);
        return;
      }

      // Hvis anden rolle end patient prøver at logge ind via /patient/login → afvis
      if (window.location.pathname === "/patient/login" && role !== "patient") {
        onRoleError?.(role);
        return;
      }

      // kun redirect hvis ikke deaktiveret, i createclinic slår vi det fra
      if (options?.disableRedirect) return;

      // Redirect baseret på rolle
      switch (role) {
        case "admin":
          if (!data.user.clinicId) {
            // Hvis admin endnu ikke har en klinik → send videre til opret klinik-siden
            navigate("/createclinic");
          } else {
            navigate("/admin/frontpage");
          }
          break;
        case "doctor":
          navigate("/doctor/dashboard");
          break;
        case "secretary":
          navigate("/secretary/dashboard");
          break;
        case "patient":
          navigate("/patient/frontpage");
          break;
        default:
          navigate("/");
      }
    },
    onError: (error: any) => {
      // 429-rate limiter toaster
      if (error.response?.status === 429) {
        toast({
          title: "For mange loginforsøg",
          description: error.response.data.message,
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "bottom-right",
        });
        return;
      }

      // fallback ved 400 eller 500
      toast({
        title: "Login mislykkedes",
        description:
          error.response?.data?.message || "Uventet fejl. Prøv igen senere.",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-right",
      });
    },
  });
};
