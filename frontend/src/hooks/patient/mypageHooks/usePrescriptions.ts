import { useQuery } from "@tanstack/react-query";
import { api } from "../../../services/httpClient";
import { useAuth } from "@/context/AuthContext";

export const usePrescriptions = () => {
  const { user } = useAuth();
  const patientId = user?._id;

  return useQuery({
    queryKey: ["prescriptions", patientId],
    queryFn: async () => {
      const res = await api.get(`/patients/prescriptions/${patientId}`);
      return res.data;
    },
    enabled: !!patientId,
  });
};
