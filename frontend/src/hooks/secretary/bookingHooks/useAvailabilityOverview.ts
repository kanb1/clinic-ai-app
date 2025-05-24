import { useQuery } from "@tanstack/react-query";
import { api } from "../../../services/httpClient";

interface AvailabilityItem {
  doctorId: string;
  doctorName: string;
  date: string;
  availableSlots: number;
}

export const useAvailabilityOverview = (
  weekStart: string,
  doctorId?: string
) => {
  return useQuery<AvailabilityItem[]>({
    queryKey: ["availability", weekStart, doctorId],
    queryFn: async () => {
      const res = await api.get("/secretary/availability", {
        params: { weekStart, doctorId },
      });
      return res.data;
    },
    enabled: !!weekStart, // kør kun hvis weekStart findes
  });
};
