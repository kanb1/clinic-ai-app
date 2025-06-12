import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { api } from "@/services/httpClient";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@chakra-ui/react";

export const useLogout = () => {
  const { setUser, setToken } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const toast = useToast();

  const logout = async () => {
    try {
      await api.post("/auth/logout"); // kalder backend og sletter jti
    } catch (error) {
      console.error("Logout failed:", error);
      // selv hvis backend fejler, ryd local state

      // stadig fortsæt med cleanup
    } finally {
      // Ryd React Query cache
      queryClient.clear();
      // Ryd frontend session

      setUser(null);
      setToken(null);
      // Navigér og vis besked
      navigate("/");
      toast({
        title: "Du er nu logget ud",
        status: "info",
        duration: 4000,
        isClosable: true,
      });
    }
  };

  return logout;
};
