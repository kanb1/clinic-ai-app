import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../../services/httpClient";

export const useMarkMessageAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (messageId: string) => {
      const res = await api.patch(`/patients/messages/${messageId}/read`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages", "unread"] });
    },
  });
};
