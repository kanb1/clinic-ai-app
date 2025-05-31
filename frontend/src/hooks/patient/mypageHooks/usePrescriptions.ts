import { useQuery } from "@tanstack/react-query";
import { api } from "../../../services/httpClient";

export const usePrescriptions = (
  patientId: string | undefined,
  isEnabled: boolean
) => {
  return useQuery({
    queryKey: ["prescriptions", patientId],
    queryFn: async () => {
      if (!patientId) throw new Error("patientId er ikke sat endnu");
      const res = await api.get(`/patients/prescriptions/${patientId}`);
      return res.data;
    },
    enabled: isEnabled && !!patientId,
  });
};
