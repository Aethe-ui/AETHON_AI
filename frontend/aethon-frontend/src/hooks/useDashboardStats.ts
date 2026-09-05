import { useQuery } from "@tanstack/react-query";
import { fetchDashboardStats } from "../services/dashboardService";

export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: fetchDashboardStats,
    staleTime: 60_000,
    refetchOnWindowFocus: true,
  });
}
