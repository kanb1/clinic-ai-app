import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/httpClient";

export const useDeleteSecretary = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/admin/staff/secretaries/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-secretaries"] });
    },
  });
};
