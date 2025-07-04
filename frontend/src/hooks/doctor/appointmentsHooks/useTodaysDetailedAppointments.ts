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

interface ApiResponse {
  data: ITodaysAppointment[];
  total: number;
  page: number;
  totalPages: number;
}

export const useTodaysDetailedAppointments = (
  page: number, //hvilken side af resultater vi vil hente
  limit: number = 6 //aftaler pr side
) => {
  return useQuery<ApiResponse>({
    // hver side caches seperat
    queryKey: ["todays-appointments-detailed", page],
    queryFn: async () => {
      const res = await api.get(
        `/doctors/appointments/today-details?page=${page}&limit=${limit}`
      );
      return res.data;
    },
  });
};
