import { useQuery } from '@tanstack/react-query';
import { fetchCases, fetchCase } from '@/services/caseService';

export function useCases() {
  return useQuery({
    queryKey: ['cases'],
    queryFn: fetchCases,
    staleTime: 15000,
  });
}

export function useCase(caseId: string) {
  return useQuery({
    queryKey: ['case', caseId],
    queryFn: () => fetchCase(caseId),
    enabled: !!caseId,
    staleTime: 10000,
  });
}
