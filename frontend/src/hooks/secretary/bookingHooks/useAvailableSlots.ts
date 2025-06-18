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
    // hvis weekstart/doctorid ændrer sig -> nyt api-kald
    // nyt cache-kombi i availability-slots ->  ["availability-slot", "2025-06-17", "læge1"]
    // cahces og behandles individuelt
    queryKey: ["availability-slots", weekStart, doctorId],
    queryFn: async () => {
      // params bliver dynamisk objekt -> Record (objekt med key, value er string) -> weekstart værdien i params-objektet
      const params: Record<string, string> = { weekStart };
      // hvis dodctor er defineret -> tilføj ny key til aprams-objekt
      if (doctorId) params.doctorId = doctorId;

      const res = await api.get("/secretary/availability-slots", { params });
      return res.data;
    },
    enabled: !!weekStart, //kør kun hvis vi har weekstart
  });
};
