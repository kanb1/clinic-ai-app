import { useQuery } from "@tanstack/react-query";
import { api } from "../../../services/httpClient";

interface AvailabilityItem {
  doctorId: string;
  doctorName: string;
  date: string;
  availableSlots: number;
}

export const useAvailabilityOverview = (
  // hook tager to parametre som påkrævet:
  weekStart: string, //weekstart, altså uge-start
  doctorId?: string //doctorid som valfri (?)
  // for at hente ledige tider pr læge, i en bestemt uge
) => {
  // forventede svar er en liste af availabilityitem objects
  return useQuery<AvailabilityItem[]>({
    // key der bestemmer hvornår react qyer genbruger cache eller laver et nyt kald
    // forskellige forespørgsler --> hvis man vælger en anden uge så sendes en ny forespørgsel --> unik cache pr ny forespørgsel i "availability"-keyet
    queryKey: ["availability", weekStart, doctorId],
    // sender request med parametre
    queryFn: async () => {
      const res = await api.get("/secretary/availability", {
        params: { weekStart, doctorId },
      });
      // ledige tider pr læge
      return res.data;
    },
    // kør kun hvis weekStart findes
    // så ved backend præcis hvilken uge vi er i
    // ellers vil backend returnere al data for alle uger
    enabled: !!weekStart,
  });
};
