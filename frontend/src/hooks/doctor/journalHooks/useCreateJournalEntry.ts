import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/httpClient";

interface CreateJournalEntryPayload {
  journalId: string;
  appointmentId: string;
  notes: string;
}

export const useCreateJournalEntry = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, CreateJournalEntryPayload>({
    mutationFn: async ({ journalId, appointmentId, notes }) => {
      await api.post("/doctors/journalentry", {
        journalId,
        appointmentId,
        notes,
        created_by_ai: false,
      });
    },
    onSuccess: (_data, variables) => {
      // Invaliderer hooken for patientens appointments
      queryClient.invalidateQueries({
        queryKey: ["appointments-with-journal", variables.appointmentId],
        exact: false,
      });
    },
  });
};
