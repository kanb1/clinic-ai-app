import { useQuery } from "@tanstack/react-query";
import { api } from "../../services/httpClient";
import { IClinic } from "@/types/clinic.types";

export const useClinics = () => {
  return useQuery<IClinic[]>({
    queryKey: ["clinics"],
    queryFn: async () => {
      const res = await api.get("/clinics");
      return res.data;
    },
  });
};
