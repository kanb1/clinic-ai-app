import { useMutation } from "@tanstack/react-query";
import { api } from "@/services/httpClient";
import { useToast } from "@chakra-ui/react";

interface ChatInput {
  message: string;
}

interface ChatResponse {
  reply: string;
}

export const useStartChatSession = () => {
  const toast = useToast();

  return useMutation<ChatResponse, Error, ChatInput>({
    mutationFn: async (data) => {
      const res = await api.post("/patients/ai/start", data);
      return res.data;
    },

    onError: (error: any) => {
      // 429-rate limiter toaster
      if (error.response?.status === 429) {
        toast({
          title:
            "Du har sendt for mange beskeder på kort tid. Vent venligst 10 min. og prøv igen.",
          description: error.response.data.message,
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "bottom-right",
        });
        return;
      }

      // fallback ved 400 eller 500
      toast({
        title: "Ny chat åbning mislykkedes",
        description:
          error.response?.data?.message || "Uventet fejl. Prøv igen senere.",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-right",
      });
    },
  });
};
