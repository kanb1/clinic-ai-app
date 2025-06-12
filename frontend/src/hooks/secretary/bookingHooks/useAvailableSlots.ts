import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/httpClient";

interface Slot {
  slotId: string;
  doctorId: string;
  doctorName: string;
  date: string;
  start_time: string;
  end_time: string;
}

export const useAvailabilitySlots = (weekStart: string, doctorId?: string) => {
  return useQuery<Slot[]>({
    queryKey: ["availability-slots", weekStart, doctorId],
    queryFn: async () => {
      const params: Record<string, string> = { weekStart };
      if (doctorId) params.doctorId = doctorId;

      const res = await api.get("/secretary/availability-slots", { params });
      return res.data;
    },
    enabled: !!weekStart,
  });
};
