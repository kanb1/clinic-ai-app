import { useMutation } from "@tanstack/react-query";
import { api } from "@/services/httpClient";

export const useUpdateMyProfile = () => {
  return useMutation({
    mutationFn: async (formData: { email?: string; phone?: string }) => {
      const res = await api.put("/patients/profile", formData);
      return res.data;
    },
  });
};
