import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/httpClient";

export interface ITodaysAppointment {
  id: string;
  patientId: string;
  patientName: string;
  birthDate: string;
  time: string;
  symptoms: string;
  journalAvailable: boolean;
  status: "bekræftet" | "aflyst" | "udført" | "venter";
}

export const useTodaysDetailedAppointments = () => {
  return useQuery<ITodaysAppointment[]>({
    queryKey: ["todays-appointments-detailed"],
    queryFn: async () => {
      const res = await api.get("/doctors/appointments/today-details");
      return res.data;
    },
  });
};
