import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../services/httpClient";

export const useUpdateMyStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ status }: { status: "ledig" | "optaget" }) => {
      const res = await api.patch(`/users/update-status/me`, { status });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staffStatus"] });
    },
  });
};
