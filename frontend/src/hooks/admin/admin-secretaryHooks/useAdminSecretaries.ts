import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/httpClient";
import { IUser } from "@/types/user.types";

export const useAdminSecretaries = () => {
  return useQuery({
    queryKey: ["admin-secretaries"],
    queryFn: async () => {
      const res = await api.get("/admin/staff/secretaries-list");
      return res.data as IUser[];
    },
  });
};
