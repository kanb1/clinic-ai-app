import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../../services/httpClient";
import { IMessage } from "@/types/message.types";

export const useMarkMessageAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (messageId: string) =>
      api.patch(`/secretary/messages/${messageId}/read`),

    onSuccess: (_, messageId) => {
      queryClient.setQueryData<IMessage[]>(
        ["unreadMessages"], // eller ["messages"] hvis du viser både læste og ulæste
        (oldMessages) => {
          if (!oldMessages) return [];

          return oldMessages.map((msg) =>
            msg._id === messageId ? { ...msg, read: true } : msg
          );
        }
      );
    },
  });
};
