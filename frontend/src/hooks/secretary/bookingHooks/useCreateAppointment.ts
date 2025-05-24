import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/httpClient";

interface AppointmentPayload {
  patient_id: string;
  doctor_id: string;
  slot_id: string;
}

export const useCreateAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: AppointmentPayload) => {
      const response = await api.post("/secretary/appointments", payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
  });
};
