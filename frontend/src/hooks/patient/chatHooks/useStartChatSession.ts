import { useMutation } from "@tanstack/react-query";
import { api } from "@/services/httpClient";

interface ChatInput {
  message: string;
}

interface ChatResponse {
  reply: string;
}

export const useStartChatSession = () => {
  return useMutation<ChatResponse, Error, ChatInput>({
    mutationFn: async (data) => {
      const res = await api.post("/patients/ai/start", data);
      return res.data;
    },
  });
};
