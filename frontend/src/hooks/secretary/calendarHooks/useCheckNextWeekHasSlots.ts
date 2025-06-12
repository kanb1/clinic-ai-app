import { useQuery } from "@tanstack/react-query";
import { api } from "../../../services/httpClient";
import moment from "moment";

//til at tjekke om der er slots for næste uge
// til kalenderoversigten - fjern "næste uge" knap når der ik er flere tilbage

export const useCheckNextWeekHasSlots = (currentWeekOffset: number) => {
  const nextWeekStart = moment()
    .startOf("isoWeek")
    .add(currentWeekOffset + 1, "weeks")
    .format("YYYY-MM-DD");

  return useQuery({
    queryKey: ["hasSlotsNextWeek", nextWeekStart],
    queryFn: async () => {
      const res = await api.get("/secretary/availability", {
        params: { weekStart: nextWeekStart },
      });
      return res.data.length > 0;
    },

    enabled: !!nextWeekStart,
    staleTime: 1000 * 60 * 5,
  });
};
