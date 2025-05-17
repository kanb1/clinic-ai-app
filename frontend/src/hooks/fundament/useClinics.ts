import { useQuery } from "@tanstack/react-query";
import { api } from "../../services/httpClient";
import { IClinic } from "@/types/clinic.types";

// REACT QUERY: Henter data fra api og holder styr på alt dette samtidig:
// isLoading -> om dataen er ved at blive hentet
// error -> om der opstår problemer
// data -> hvad data er

export const useClinics = () => {
  // useQuery: tager objekt af flere ting
  return useQuery<IClinic[]>({
    // unikt navn for denne query, bruges af React query til at cache resultatet
    // hvis jeg bruger useclinics() andre stede,r så bliver dataen genbrugt og ikke hentet igen fra API'et
    // dataen bliver nemlig gemt i cache under nøglen ["clinics"], så når en komponent genbruger useClinics så ser rquery at den allered har data under ["clinics"]
    queryKey: ["clinics"],
    // selve funktionen der henter dataen
    queryFn: async () => {
      //get request
      const res = await api.get("/clinics");
      //   returnerer dataen på .data, får adgang til dette i komponent via "data"
      return res.data;
    },
  });
};
