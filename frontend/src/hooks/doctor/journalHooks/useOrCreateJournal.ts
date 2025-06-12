import { api } from "@/services/httpClient";
import { useQuery } from "@tanstack/react-query";

export const useOrCreateJournal = (patientId: string) => {
  return useQuery({
    queryKey: ["journalId", patientId],
    queryFn: async () => {
      const res = await api.get(`/doctors/journals/patient/${patientId}`);
      return res.data;
    },
  });
};
