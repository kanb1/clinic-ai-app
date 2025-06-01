import { api } from "@/services/httpClient";
import { useQuery } from "@tanstack/react-query";

export const useAiNotes = (appointmentId: string) => {
  return useQuery({
    queryKey: ["aiNotes", appointmentId],
    queryFn: async () => {
      const res = await api.get(`/doctors/ai-notes/${appointmentId}`);
      return res.data;
    },
  });
};
