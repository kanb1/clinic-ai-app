import { useQuery } from "@tanstack/react-query";
import { api } from "../../../services/httpClient";
import moment from "moment";

//til at tjekke om der er slots for næste uge
// til kalenderoversigten - fjern "næste uge" knap når der ik er flere tilbage

// currentWeekOffset: giver 0 på nuværende, 1 hvis du på næste, osv
export const useCheckNextWeekHasSlots = (currentWeekOffset: number) => {
  // moment -> henter nuværende dato
  const nextWeekStart = moment()
    .startOf("isoWeek") // sætter dato til mandag i nuværende uge
    .add(currentWeekOffset + 1, "weeks") //hopper frem til mandag i næste uge
    .format("YYYY-MM-DD"); //lav streng

  return useQuery({
    // key til cache -> kombinerer key med nextWeekStart-datoen
    // ændres når currentWeekOffset ændres
    queryKey: ["hasSlotsNextWeek", nextWeekStart],
    queryFn: async () => {
      const res = await api.get("/secretary/availability", {
        params: { weekStart: nextWeekStart },
      });
      // mindst 1 slot -> returnerer true ellers false
      return res.data.length > 0;
    },

    //kør kun hvis nextweekstart er sat (altså aldrig undefined)
    enabled: !!nextWeekStart,
    // laver ik et nyt kald i 5 minutter -> bruger cached version
    // reducer api-kald -> klikker meget frem og tilbage i UI
    staleTime: 1000 * 60 * 5,
  });
};
