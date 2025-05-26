import { useQuery } from "@tanstack/react-query";
import { api } from "../../../services/httpClient";
// dato-manipulation - finde starten af næste uge
import moment from "moment";

//til at tjekke om der er slots for næste uge
// til kalenderoversigten - fjern "næste uge" knap når der ik er flere tilbage

// currentWeekOffset: repræsenterer hvor mange uger fremme vi er i visningen
// fx 0 = denne uge, 1 = næste uge osv
export const useCheckNextWeekHasSlots = (currentWeekOffset: number) => {
  // beregne datoen for mandag i næste uge, baseret på currentWeekOffset
  // moment() giver dagens dato
  const nextWeekStart = moment()
    // .startOf("isoWeek") går til mandag i den uge (ISO-uge = mandag starter ugen)
    .startOf("isoWeek")
    // .add(currentWeekOffset + 1, "weeks") går frem til næste uge i forhold til den aktuelle offset
    .add(currentWeekOffset + 1, "weeks")
    // api skal bruge det i denne her format
    .format("YYYY-MM-DD");

  return useQuery({
    // navn på vores cache
    // nextWeekStart: sikrer at cache opdateres, når ugen skifter
    queryKey: ["hasSlotsNextWeek", nextWeekStart],
    queryFn: async () => {
      const res = await api.get("/secretary/availability", {
        // bruger params til at sende datoen som query-parameter

        params: { weekStart: nextWeekStart },
      });
      //res.data: et array af ledige tider
      return res.data.length > 0; // true hvis der er slots, false hvis tomt array
    },
    // enabled bestemmer, om query’en skal køre
    // !!nextWeekStart for at sikre, at den kun kører hvis nextWeekStart findes og ikke er null eller undefined
    enabled: !!nextWeekStart,
    staleTime: 1000 * 60 * 5, // 5 minutter cache holdetid
  });
};

// denne her hook brugesfor at bla undgå denne her spinner kører uendelig i stedet for at få fallback besked
// hooken bruges til at fortælle om true/false om slots næste uge - vis næste knap eller ej
