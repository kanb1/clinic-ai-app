import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../../services/httpClient";

export const useConfirmAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (appointmentId: string) => {
      const res = await api.patch(
        `/patients/appointments/${appointmentId}/confirm`
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments", "upcoming"] });
    },
  });
};
