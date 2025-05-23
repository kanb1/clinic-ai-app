// usePastAppointmentsToday.ts
import { useQuery } from "@tanstack/react-query";
import { api } from "../../../services/httpClient";
import { IAppointment } from "@/types/appointment.types";

export const usePastAppointmentsToday = () => {
  return useQuery<IAppointment[]>({
    queryKey: ["pastAppointmentsToday"],
    queryFn: async () => {
      const res = await api.get("/secretary/appointments/past-today");
      return res.data;
    },
  });
};
