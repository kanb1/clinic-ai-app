import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/httpClient";

interface CreateJournalEntryPayload {
  journalId: string;
  appointmentId: string;
  notes: string;
}

export const useCreateJournalEntry = () => {
  const queryClient = useQueryClient();

  // void -> mutation returnerer ik noget data
  // error -> typen af fejl
  return useMutation<void, Error, CreateJournalEntryPayload>({
    mutationFn: async ({ journalId, appointmentId, notes }) => {
      await api.post("/doctors/journalentry", {
        journalId,
        appointmentId,
        notes,
        //når læge selv skriver notat
        // backend bruger til at gemme metadata -> hvem har lavet notat
        created_by_ai: false,
      });
    },
    onSuccess: (_data, variables) => {
      // Invaliderer hooken for patientens appointments
      queryClient.invalidateQueries({
        queryKey: ["appointments-with-journal", variables.appointmentId],
        //alle queries der matcher delvist bliver ramt
        // ex hvis der var nøgle ["appwithjournal..", "abc", "ekstra cach"] --> har tre caches -> ram også dem
        exact: false,
      });
    },
  });
};
