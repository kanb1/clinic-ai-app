import { useMutation } from "@tanstack/react-query";
import { api } from "@/services/httpClient";

interface SystemMessagePayload {
  content: string;
  receiver_scope: "all" | "staff" | "patients";
}

export const useSendSystemMessage = () => {
  return useMutation({
    mutationFn: async (data: SystemMessagePayload) => {
      const res = await api.post("/admin/system-messages", {
        ...data,
        type: "system",
      });
      return res.data;
    },
  });
};
