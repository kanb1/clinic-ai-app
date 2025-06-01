import { useMutation } from "@tanstack/react-query";
import { api } from "@/services/httpClient";

export const useCreateJournalEntry = () => {
  return useMutation({
    mutationFn: async ({
      journalId,
      appointmentId,
      notes,
    }: {
      journalId: string;
      appointmentId: string;
      notes: string;
    }) => {
      return api.post("/doctors/journalentry", {
        journalId,
        appointmentId,
        notes,
        created_by_ai: false,
      });
    },
  });
};
