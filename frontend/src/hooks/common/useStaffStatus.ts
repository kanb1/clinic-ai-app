import { useQuery } from "@tanstack/react-query";
import { api } from "../../services/httpClient";
import { IUser } from "../../types/user.types";

export const useStaffStatus = () => {
  return useQuery<IUser[]>({
    queryKey: ["staff"],
    queryFn: async () => {
      const res = await api.get("/users/staff-statuses");
      return res.data;
    },
  });
};
