import apiClient from './apiClient';
import { ENDPOINTS } from '@/api/endpoints';
import { DashboardDataSchema, type DashboardData } from '@/schemas/dashboard';
import dashboardMock from '../../mock/dashboard.json';

const useMock = import.meta.env.VITE_USE_MOCK === 'true';

export async function fetchDashboardData(): Promise<DashboardData> {
  if (useMock) {
    return DashboardDataSchema.parse(dashboardMock);
  }
  const { data } = await apiClient.get(ENDPOINTS.DASHBOARD_STATS);
  return DashboardDataSchema.parse(data);
}
