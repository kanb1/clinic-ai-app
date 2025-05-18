import { useMutation } from "@tanstack/react-query";
import { api } from "@/services/httpClient";
import { IClinic } from "@/types/clinic.types";

interface ClinicData {
  name: string;
  address: string;
}

export const useCreateClinic = () => {
  return useMutation<IClinic, any, ClinicData>({
    // min post request
    mutationFn: async (data: ClinicData) => {
      const response = await api.post("/clinics", data);
      // IClinic er returtypen altså typet din model fra backend
      return response.data as IClinic;
    },
  });
};
