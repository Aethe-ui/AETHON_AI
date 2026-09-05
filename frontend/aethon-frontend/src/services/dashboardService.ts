import apiClient from "./apiClient";
import { DashboardStatsSchema } from "../schemas/dashboardStats";
import type { DashboardStats } from "../types";

const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

export async function fetchDashboardStats(): Promise<DashboardStats> {
  if (USE_MOCK) {
    const data = await import("../../mock/dashboard.json");
    return DashboardStatsSchema.parse(data.default);
  }
  const res = await apiClient.get("/api/dashboard/stats");
  return DashboardStatsSchema.parse(res.data);
}
