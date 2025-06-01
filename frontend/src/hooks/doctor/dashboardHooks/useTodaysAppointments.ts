import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/httpClient";
import { IAppointment } from "@/types/appointment.types";

export const useTodaysAppointments = () => {
  return useQuery<IAppointment[]>({
    queryKey: ["todays-appointments"],
    queryFn: async () => {
      const res = await api.get("/doctors/appointments/today");
      return res.data.appointments;
    },
  });
};
