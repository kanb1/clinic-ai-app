import { useMutation } from "@tanstack/react-query";
import { api } from "@/services/httpClient";

export const useSaveChatHistory = () => {
  return useMutation({
    mutationFn: async (data: {
      messages: { user: string; ai: string }[];
      appointmentId: string;
    }) => {
      const res = await api.post("/patients/ai/save-chat", data);
      return res.data;
    },
  });
};
