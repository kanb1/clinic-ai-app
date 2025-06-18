import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../../services/httpClient";
import { IMessage } from "@/types/message.types";

export const useMarkMessageAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (messageId: string) =>
      api.patch(`/secretary/messages/${messageId}/read`),

    // opdater cache manuelt -> når ser er siger besked markeret som læst
    // så ui opdaterer straks når besked læst
    // onsuccess har normalt data i argument -> "_ "-> ignorer data, bruges ik her
    onSuccess: (_, messageId) => {
      // går ind og finder eksisterende cache
      // eller ["messages"] hvis du viser både læste og ulæste
      // setQueryData vs Invalidate... -> opdater direkte cache selv vs hent fofra -> gør alt direkte, undgå api-kald
      queryClient.setQueryData<IMessage[]>(
        ["unreadMessages"],
        // går igennem listen af beskeder hvis findes
        (oldMessages) => {
          if (!oldMessages) return [];
          return oldMessages.map((msg) =>
            // finder den besked med rigtige id (sammenlign)
            // ændrer read til true - lokalt i cachen
            msg._id === messageId ? { ...msg, read: true } : msg
          );
        }
      );
    },
  });
};
