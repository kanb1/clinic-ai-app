import { useQuery } from "@tanstack/react-query";
import { api } from "../../../services/httpClient";
import { IAppointment } from "@/types/appointment.types";

export const useUpcomingAppointments = () => {
  return useQuery<IAppointment[]>({
    queryKey: ["appointments", "upcoming"],
    queryFn: async () => {
      const res = await api.get("/patients/appointments/upcoming");
      return res.data;
    },
  });
};
