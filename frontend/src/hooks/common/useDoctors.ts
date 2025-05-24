import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/httpClient";

export interface IDoctor {
  _id: string;
  id: string; // svarer til _id i backend
  name: string;
}

export const useDoctors = () => {
  return useQuery<IDoctor[]>({
    queryKey: ["doctors"],
    queryFn: async () => {
      const { data } = await api.get("/admin/staff/doctors-list");
      return data;
    },
  });
};
