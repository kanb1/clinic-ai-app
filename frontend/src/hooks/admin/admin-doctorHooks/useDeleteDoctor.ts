import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/httpClient";

export const useDeleteDoctor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    // id bliver sendt når denne mutation bliver kaldt
    // kommer fra url og derfor ik "data:"
    mutationFn: async (id: string) => {
      await api.delete(`/admin/staff/doctors/${id}`);
    },
    onSuccess: () => {
      // cache er koblet til doctors list hooket
      queryClient.invalidateQueries({ queryKey: ["admin-doctors"] });
    },
  });
};
