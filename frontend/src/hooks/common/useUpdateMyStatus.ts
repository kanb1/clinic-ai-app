import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../services/httpClient";

export const useUpdateMyStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    // forventer objekt med felt "status" - vi kalder for {status} i stedet for data -> indeholder dataen fra komponent (ledig/optaget)
    // strammer værdierne med ts "ledig"/"optaget"
    mutationFn: async ({ status }: { status: "ledig" | "optaget" }) => {
      // sender request med status i body
      const res = await api.patch(`/users/update-status/me`, { status });
      // resultatet af mutationens data-felt
      return res.data;
    },
    onSuccess: () => {
      //
      queryClient.invalidateQueries({ queryKey: ["staff"] });
    },
  });
};
