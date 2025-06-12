import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/httpClient";

export const useUpdateMyProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: { email?: string; phone?: string }) => {
      const res = await api.put("/patients/profile", formData);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myProfile"] });
    },
  });
};
