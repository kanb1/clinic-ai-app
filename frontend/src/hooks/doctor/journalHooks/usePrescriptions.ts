import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/httpClient";

export const usePrescriptions = (patientId: string | null) => {
  return useQuery({
    queryKey: ["prescriptions", patientId],
    queryFn: async () => {
      if (!patientId) return [];
      const res = await api.get(`/doctors/prescriptions/${patientId}`);
      return res.data;
    },
    enabled: !!patientId, // kun hvis patientId findes -> kør hook
  });
};
