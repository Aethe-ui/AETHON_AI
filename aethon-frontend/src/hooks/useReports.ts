import { useQuery } from '@tanstack/react-query';
import { fetchReports } from '@/services/reportService';

export function useReports() {
  return useQuery({
    queryKey: ['reports'],
    queryFn: fetchReports,
    staleTime: 30000,
  });
}
