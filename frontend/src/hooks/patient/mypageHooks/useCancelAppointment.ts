import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../../services/httpClient";

export const useCancelAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (appointmentId: string) => {
      const res = await api.patch(
        `/patients/appointments/${appointmentId}/cancel`
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments", "upcoming"] });
    },
  });
};
