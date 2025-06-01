export interface IJournalEntry {
  id: string;
  notes: string;
  createdByAI: boolean;
  createdAt: string;
  appointmentDate?: string;
  appointmentTime?: string;
  doctorName?: string;
  doctorRole?: string;
  appointmentId?: string;
}
