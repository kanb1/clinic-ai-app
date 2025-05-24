import { useQuery } from "@tanstack/react-query";
import { api } from "../../../services/httpClient";

export const useAppointments = () => {
  return useQuery({
    queryKey: ["appointments"],
    queryFn: async () => {
      const res = await api.get("/secretary/appointments");
      return res.data;
    },
  });
};
