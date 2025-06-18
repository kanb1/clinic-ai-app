import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/httpClient";

export interface IDoctor {
  _id: string;
  id: string; // svarer til _id i backend
  name: string;
}

export const useDoctors = () => {
  // forventer at få en liste af IDoctor-objekter (types)
  return useQuery<IDoctor[]>({
    // unik identification for data -> gemt i cache
    queryKey: ["doctors"],
    queryFn: async () => {
      const { data } = await api.get("/admin/staff/doctors-list");
      // returnerer JSON-dataen
      return data;
    },
  });
};
