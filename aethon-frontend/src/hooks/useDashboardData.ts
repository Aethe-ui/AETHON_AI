import { useQuery } from '@tanstack/react-query';
import { fetchDashboardData } from '@/services/dashboardService';

export function useDashboardData() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: fetchDashboardData,
    refetchInterval: 60000, // Refresh every minute for live data
    staleTime: 30000,
  });
}
