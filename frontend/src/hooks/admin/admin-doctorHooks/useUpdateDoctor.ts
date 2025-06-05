import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/httpClient";

interface UpdateDoctorInput {
  id: string;
  email: string;
  phone: string;
  name: string;
  address: string;
}

export const useUpdateDoctor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      email,
      phone,
      name,
      address,
    }: UpdateDoctorInput) => {
      await api.put(`/admin/staff/doctors/${id}`, {
        email,
        phone,
        name,
        address,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-doctors"] });
    },
  });
};
