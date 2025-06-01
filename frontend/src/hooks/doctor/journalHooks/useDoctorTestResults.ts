import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/httpClient";

export const useDoctorTestResults = (patientId: string) => {
  return useQuery({
    queryKey: ["doctorTestResults", patientId],
    queryFn: async () => {
      const res = await api.get(`/doctors/testresults/${patientId}`);
      return res.data;
    },
    enabled: !!patientId,
  });
};
