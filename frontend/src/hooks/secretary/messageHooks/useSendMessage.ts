import { useMutation } from "@tanstack/react-query";
import { api } from "../../../services/httpClient";

// Hvordan min besked skal se ud
interface SendMessagePayload {
  content: string;
  type: "besked" | "aflysning" | "system";
  receiver_scope: "all" | "patients" | "staff" | "individual";
  receiver_id?: string; //valgfri da den kun skal bruges hvis receiver_scope er "individual"
}

export const useSendMessage = () => {
  return useMutation({
    // mutationFn: selve funktionen der bliver kaldt når der bliver sendt en besked
    // modtager en payload: en besked i den format jeg har angivet i interface
    mutationFn: async (payload: SendMessagePayload) => {
      // sender post request til denne her api-endpoint der er min backend logik for at sende beskeder
      // payload bliver sendt med som body i requesten
      const res = await api.post("/secretary/messages", payload);
      return res.data;
    },
  });
};
