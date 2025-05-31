import { useQuery } from "@tanstack/react-query";
import { api } from "../../../services/httpClient";

export const useUnreadMessages = () => {
  return useQuery({
    queryKey: ["messages", "unread"],
    queryFn: async () => {
      const res = await api.get("/patients/messages/unread");
      return res.data;
    },
  });
};
