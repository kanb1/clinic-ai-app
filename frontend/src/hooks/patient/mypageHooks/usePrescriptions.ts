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
    //kør kun hvis patientId findes
    //hent kun når vi ønsker hooken skal være aktiv -> når patientId er sat:
    //const {data: prescriptions} = usePrescriptions(patientId);
    enabled: isEnabled && !!patientId,
  });
};
