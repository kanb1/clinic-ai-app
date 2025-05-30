import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/httpClient";
import { IUser } from "@/types/user.types";

interface CreateSecretaryInput {
  name: string;
  email: string;
  password: string;
}

export const useCreateSecretary = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateSecretaryInput) => {
      const res = await api.post("/admin/staff/secretary", data);
      return res.data as IUser;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-secretaries"] });
    },
  });
};
