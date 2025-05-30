import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/httpClient";

interface UpdateDoctorInput {
  id: string;
  email: string;
  phone: string;
}

export const useUpdateDoctor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, email, phone }: UpdateDoctorInput) => {
      await api.put(`/admin/staff/doctors/${id}`, { email, phone });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-doctors"] });
    },
  });
};
