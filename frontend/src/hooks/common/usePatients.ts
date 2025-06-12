import { useQuery } from "@tanstack/react-query"; //data, isLoading, error
import { api } from "../../services/httpClient";

import { IUser } from "@/types/user.types";

export const usePatients = () => {
  return useQuery<IUser[]>({
    queryKey: ["patients"],
    queryFn: async () => {
      const res = await api.get("/users/patients");
      return res.data;
    },
  });
};
