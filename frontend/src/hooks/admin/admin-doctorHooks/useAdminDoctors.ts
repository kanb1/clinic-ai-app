// get all doctors
import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/httpClient";
import { IUser } from "@/types/user.types";

export const useAdminDoctors = () => {
  return useQuery({
    queryKey: ["admin-doctors"],
    queryFn: async () => {
      const res = await api.get("/admin/staff/doctors-list");
      return res.data as IUser[];
    },
  });
};
