import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/httpClient";
import { IUser } from "@/types/user.types";

// Hook til adminens version af patientlisten
export const useAdminPatients = () => {
  return useQuery<IUser[]>({
    queryKey: ["admin-patients"],
    queryFn: async () => {
      const res = await api.get("/admin/patients-list"); // ← korrekt route
      return res.data;
    },
  });
};
