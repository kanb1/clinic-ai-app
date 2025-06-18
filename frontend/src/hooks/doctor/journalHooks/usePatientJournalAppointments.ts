import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/httpClient";

export interface JournalEntry {
  _id: string;
  notes: string;
  created_by_ai: boolean;
  createdAt: string;
}

export interface AppointmentWithJournal {
  _id: string;
  date: string;
  time: string;
  doctorName: string;
  status: string;
  secretaryNote: string | null;
  journalEntry: JournalEntry | null;
}

export const usePatientJournalAppointments = (patientId: string) => {
  return useQuery<AppointmentWithJournal[]>({
    queryKey: ["appointments-with-journal", patientId],
    queryFn: async () => {
      const res = await api.get(
        `/doctors/appointments-with-journal/${patientId}`
      );
      return res.data;
    },
    enabled: !!patientId, // kun hvis patientId findes -> kør hook
  });
};
