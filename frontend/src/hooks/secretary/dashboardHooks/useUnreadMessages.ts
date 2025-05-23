import { useQuery } from "@tanstack/react-query";
import { api } from "../../../services/httpClient";
import { IMessage } from "../../../types/message.types";

export const useUnreadMessages = () => {
  return useQuery<IMessage[]>({
    queryKey: ["unreadMessages"],
    queryFn: async () => {
      const res = await api.get("/secretary/messages/unread");
      return res.data;
    },
  });
};
