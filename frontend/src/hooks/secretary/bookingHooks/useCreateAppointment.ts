import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/httpClient";

interface AppointmentPayload {
  patient_id: string;
  doctor_id: string;
  slot_id: string;
  secretary_note: string;
}

export const useCreateAppointment = () => {
  // bruge til at invalider cache senere
  const queryClient = useQueryClient();

  return useMutation({
    // tager payload som argument
    mutationFn: async (payload: AppointmentPayload) => {
      //sender payload (data objektet) til backend
      const response = await api.post("/secretary/appointments", payload);
      return response.data;
    },
    // når appointment er booket -->Invalider alle invalidateQueries
    // react query refetcher alt når denne kaldes, næste gnag det vises
    // sikrer availability og availability-slots bliver opdateret med de nye data - så cache ik stadig viser det som ledig
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [
          "availability-slots",
          "availability-overview",
          "appointments",
        ],
      });
    },
  });
};
