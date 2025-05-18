import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/httpClient";
import { IClinic } from "@/types/clinic.types";

export const useMyClinic = () => {
  return useQuery<IClinic>({
    queryKey: ["myClinic"],
    queryFn: async () => {
      const response = await api.get("/clinics/my");
      return response.data;
    },
    retry: false,
  });
};
