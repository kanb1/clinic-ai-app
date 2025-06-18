import { useMutation } from "@tanstack/react-query";
import { api } from "@/services/httpClient";
import { IClinic } from "@/types/clinic.types";

interface ClinicData {
  name: string;
  address: string;
}

export const useCreateClinic = () => {
  return useMutation<IClinic, any, ClinicData>({
    mutationFn: async (data: ClinicData) => {
      // data -> klinikobjekt vi sender til backend
      const response = await api.post("/clinics", data);
      return response.data as IClinic;
    },
  });
};
