import { useMutation } from "@tanstack/react-query";
import { api } from "@/services/httpClient";

export const useCreatePrescription = () => {
  return useMutation({
    mutationFn: async (payload: {
      patient_id: string;
      medication_name: string;
      dosage: string;
      instructions: string;
    }) => {
      const res = await api.post("/doctors/prescriptions", payload);
      return res.data;
    },
  });
};
