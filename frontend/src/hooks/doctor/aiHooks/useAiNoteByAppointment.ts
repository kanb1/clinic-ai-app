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

export const useAiNoteByAppointment = (appointmentId: string | null) => {
  return useQuery<ChatSessionResponse | null>({
    queryKey: ["aiNotes", appointmentId],
    queryFn: async () => {
      if (!appointmentId) return null;
      const res = await api.get(`/doctors/ai-notes/${appointmentId}`);
      return res.data;
    },
    enabled: !!appointmentId,
    retry: false,
  });
};
