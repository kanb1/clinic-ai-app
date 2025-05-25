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

// henter alle konkrete ledige tidspunkter i et 3 ugers interval fra weekStart
// når dag i en uge er valgt
export const useAvailabilitySlots = (weekStart: string, doctorId?: string) => {
  // hetner en liste af slot-objekter
  return useQuery<Slot[]>({
    // gem dette svar som data til uge og læge
    // så hvis jeg skifter uge eller læge, laver den et nyt API-kald
    queryKey: ["availability-slots", weekStart, doctorId],
    queryFn: async () => {
      // /secretary/availability-slots?weekStart=2025-05-27&doctorId=abc123
      const res = await api.get("/secretary/availability-slots", {
        params: { weekStart, doctorId },
      });
      return res.data;
    },
    // kør kun hvis vi har weekStart for at undgå at få alle ledige tider
    enabled: !!weekStart,
  });
};
