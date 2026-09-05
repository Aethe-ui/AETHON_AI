import { useQuery } from "@tanstack/react-query";
import { fetchCase } from "../services/caseService";

export function useCase(caseId: string | undefined) {
  return useQuery({
    queryKey: ["case", caseId],
    queryFn: () => fetchCase(caseId!),
    enabled: Boolean(caseId),
    staleTime: 30_000,
  });
}
