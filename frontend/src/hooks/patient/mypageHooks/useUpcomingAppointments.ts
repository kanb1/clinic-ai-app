import { useQuery } from "@tanstack/react-query";
import { api } from "../../../services/httpClient";

export const useUpcomingAppointments = () => {
  return useQuery({
    queryKey: ["appointments", "upcoming"],
    queryFn: async () => {
      const res = await api.get("/patients/appointments/upcoming");
      return res.data;
    },
  });
};
