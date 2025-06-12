import { useMutation } from "@tanstack/react-query";
import { api } from "../../../services/httpClient";
import { useToast } from "@chakra-ui/react";

interface SendMessagePayload {
  content: string;
  type: "besked" | "aflysning" | "system";
  receiver_scope: "all" | "patients" | "staff" | "individual";
  receiver_id?: string;
}

export const useSendMessage = () => {
  const toast = useToast();

  return useMutation({
    mutationFn: async (payload: SendMessagePayload) => {
      const res = await api.post("/secretary/messages", payload);
      return res.data;
    },
    onError: (error: any) => {
      if (error.response?.status === 429) {
        toast({
          title:
            "Du har sendt for mange beskeder på for kort tid. Prøv igen om 20. minutter",
          description: error.response.data.message,
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "bottom-right",
        });
        return;
      }

      toast({
        title: "Besked-afsendelse mislykkedes",
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
