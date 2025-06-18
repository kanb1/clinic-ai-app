import { useQuery } from "@tanstack/react-query";
import { api } from "../../../services/httpClient";

interface AvailabilityItem {
  doctorId: string;
  doctorName: string;
  date: string;
  availableSlots: number;
}

//henter overblik voer ledige tider for bestemt læge og uge
export const useAvailabilityOverview = (
  weekStart: string,
  doctorId?: string
) => {
  return useQuery<AvailabilityItem[]>({
    // hvis weekstart/doctorid ændrer sig -> nyt api-kald
    // nyt cache-kombi i availability ->  fx: ["availability", "2025-06-17", "læge1"]
    // cahces og behandles individuelt
    queryKey: ["availability", weekStart, doctorId],
    queryFn: async () => {
      // sender query params -> backend får weekstart og doctor med i URL'en
      const res = await api.get("/secretary/availability", {
        params: { weekStart, doctorId },
      });
      return res.data;
    },

    enabled: !!weekStart, //kør kun hvis vi har weekstart
  });
};
