import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/httpClient";
import { IJournalEntry } from "@/types/journal.types";

export const useJournalDetails = (journalId: string) => {
  return useQuery<IJournalEntry[]>({
    queryKey: ["journal", journalId],
    queryFn: async () => {
      const res = await api.get(`/doctors/journals/${journalId}`);
      return res.data.entries;
    },
    enabled: !!journalId,
  });
};
