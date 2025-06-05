import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/httpClient";

export const useMyProfile = () => {
  return useQuery({
    queryKey: ["myProfile"],
    queryFn: async () => {
      const res = await api.get("/users/me");
      return res.data; // { user: {...} } med alle info
    },
  });
};
