import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/httpClient";

export const useJournalDetails = (journalId: string) => {
  return useQuery({
    queryKey: ["journal", journalId],
    queryFn: async () => {
      const res = await api.get(`/doctors/journals/${journalId}`);
      return res.data.entries;
    },
  });
};
