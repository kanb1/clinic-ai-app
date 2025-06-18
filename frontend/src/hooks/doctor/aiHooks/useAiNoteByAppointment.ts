import { api } from "@/services/httpClient";
import { useQuery } from "@tanstack/react-query";

interface AiMessage {
  user: string;
  ai: string;
}

interface ChatSessionResponse {
  messages: AiMessage[];
  patient_id: string;
  createdAt: string;
  summary_for_doctor?: string;
}

// kræver appointid som input (string/null)
export const useAiNoteByAppointment = (appointmentId: string | null) => {
  return useQuery<ChatSessionResponse | null>({
    // hver aftale (appointmentId) får sin egen cache
    queryKey: ["aiNotes", appointmentId],
    queryFn: async () => {
      if (!appointmentId) return null;
      const res = await api.get(`/doctors/ai-notes/${appointmentId}`);
      return res.data;
    },
    // hent kun data -> hvis appointmentId er sand (truthy)
    // ingen fetch før vi har id
    enabled: !!appointmentId,
    // slår auto-retry fetch fra -> true by default
    // retry'er ik ved fejl
    retry: false,
  });
};
