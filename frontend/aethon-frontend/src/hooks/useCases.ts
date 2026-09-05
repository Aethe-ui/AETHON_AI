import { useQuery } from "@tanstack/react-query";
import { fetchCases } from "../services/caseService";

export function useCases() {
  return useQuery({
    queryKey: ["cases"],
    queryFn: fetchCases,
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  });
}
