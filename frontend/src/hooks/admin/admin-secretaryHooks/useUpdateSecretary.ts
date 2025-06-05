import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/httpClient";
import { IUser } from "@/types/user.types";

interface UpdateSecretaryInput {
  id: string;
  email: string;
  phone: string;
  address: string;
  name: string;
}

export const useUpdateSecretary = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      email,
      phone,
      name,
      address,
    }: UpdateSecretaryInput) => {
      const res = await api.put(`/admin/staff/secretaries/${id}`, {
        email,
        phone,
        name,
        address,
      });
      return res.data.secretary as IUser;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-secretaries"] });
    },
  });
};
