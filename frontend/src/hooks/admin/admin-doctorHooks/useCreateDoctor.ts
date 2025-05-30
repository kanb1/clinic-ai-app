import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/httpClient";
import { IUser } from "@/types/user.types";

interface AddDoctorInput {
  name: string;
  email: string;
  phone: string;
  password: string;
}

export const useCreateDoctor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newDoctor: AddDoctorInput) => {
      const res = await api.post("/admin/staff/doctors", newDoctor);
      return res.data.doctor as IUser;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-doctors"] });
    },
  });
};
