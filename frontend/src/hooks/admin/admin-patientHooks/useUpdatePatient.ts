import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/httpClient";
import { IUser } from "@/types/user.types";

interface UpdatePatientPayload {
  id: string;
  email: string;
  phone: string;
}

export const useUpdatePatient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    // parameter destructer direkte værdierne (istedet for data:)
    mutationFn: async ({ id, email, phone }: UpdatePatientPayload) => {
      // ^ ellers data.email -> med nuvræedne, renere
      const res = await api.put(`/admin/${id}`, { email, phone });
      return res.data.patient as IUser;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-patients"] });
    },
  });
};
