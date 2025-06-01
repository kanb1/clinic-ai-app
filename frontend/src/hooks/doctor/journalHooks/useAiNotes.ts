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
          return null; // Returnér tomt i stedet for fejl
        }
        throw error; // Rigtige fejl skal stadig vises
      }
    },
    enabled: !!appointmentId, // undgå at køre hvis appointmentId ikke er sat
    retry: 1, // kun prøv igen én gang
  });
};
