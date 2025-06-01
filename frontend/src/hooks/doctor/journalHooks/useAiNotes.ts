import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/httpClient";

export const useAiNotes = (appointmentId: string | null) => {
  return useQuery({
    queryKey: ["aiNotes", appointmentId],
    queryFn: async () => {
      if (!appointmentId) return null;
      try {
        const res = await api.get(`/doctors/ai-notes/${appointmentId}`);
        return res.data;
      } catch (error: any) {
        if (error?.response?.status === 404) {
          // Undgå fejl state hvis der ikke findes AI-noter
          return { messages: [] };
        }
        throw error; // Alle andre fejl skal stadig trigger en fejl
      }
    },
    enabled: Boolean(appointmentId),
    retry: false, // Ingen retry ved 404
    staleTime: 1000 * 60 * 5, // cache i 5 min (valgfrit)
  });
};
