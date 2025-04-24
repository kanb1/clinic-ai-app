import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";

const fetchPing = async () => {
  const res = await api.get("/ping");
  return res.data;
};

export const usePing = () => {
  return useQuery({
    queryKey: ["ping"],
    queryFn: fetchPing,
  });
};
