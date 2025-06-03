import { useMutation } from "@tanstack/react-query";
import { api } from "../../../services/httpClient";
import { useToast } from "@chakra-ui/react";

// Hvordan min besked skal se ud
interface SendMessagePayload {
  content: string;
  type: "besked" | "aflysning" | "system";
  receiver_scope: "all" | "patients" | "staff" | "individual";
  receiver_id?: string; //valgfri da den kun skal bruges hvis receiver_scope er "individual"
}

export const useSendMessage = () => {
  const toast = useToast();

  return useMutation({
    // mutationFn: selve funktionen der bliver kaldt når der bliver sendt en besked
    // modtager en payload: en besked i den format jeg har angivet i interface
    mutationFn: async (payload: SendMessagePayload) => {
      // sender post request til denne her api-endpoint der er min backend logik for at sende beskeder
      // payload bliver sendt med som body i requesten
      const res = await api.post("/secretary/messages", payload);
      return res.data;
    },
    onError: (error: any) => {
      // 429-rate limiter toaster
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

      // fallback ved 400 eller 500
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
