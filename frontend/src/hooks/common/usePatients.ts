import { useQuery } from "@tanstack/react-query"; //data, isLoading, error
import { api } from "../../services/httpClient";
// bruger interfacet IUser, så hooken ved hvilken type data den forventer at få tilbage
// altså array af users
import { IUser } from "@/types/user.types";

// perfekt eksempel på en af mine hooks som kan genbruges i mine komponenter til at hente patientdata
// perfekt ift caching
export const usePatients = () => {
  // Jeg forventer at denne query returnerer et array af IUser-objekter
  return useQuery<IUser[]>({
    // En unik nøgle der identificerer denne query: cache svaret, genkende tidligere fetches, trigge refetch automatisk hvis nødvendigt
    queryKey: ["patients"],
    // queryFn, min fetchfunction
    queryFn: async () => {
      const res = await api.get("/secretary/patients");
      return res.data;
    },
  });
};

// error fanger fejl fra API’et
