import { useQuery } from "@tanstack/react-query";
import { api } from "../../../services/httpClient";
import { useAuth } from "@/context/AuthContext";

export const usePrescriptions = () => {
  const { user } = useAuth();

  const patientId = user?._id;

  console.log("patientId fra useAuth:", patientId); // debug

  return useQuery({
    queryKey: ["prescriptions", patientId],
    queryFn: async () => {
      if (!patientId) throw new Error("patientId er ikke sat endnu");
      const res = await api.get(`/patients/prescriptions/${patientId}`);
      return res.data;
    },
    enabled: !!patientId, // venter til patientId er klar
  });
};
