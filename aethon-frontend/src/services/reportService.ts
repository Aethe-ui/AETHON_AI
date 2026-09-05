import apiClient from './apiClient';
import { ENDPOINTS } from '@/api/endpoints';
import { ReportSchema, type Report } from '@/schemas/report';

const useMock = import.meta.env.VITE_USE_MOCK === 'true';

const mockReports: Report[] = [
  { reportId: 'RPT-042', caseId: 'AE-042', title: 'Forensic Report — AE-042', severity: 'critical', classification: 'Phishing', generatedAt: '2024-01-15T10:32:00Z', generatedBy: 'Sarah Chen' },
  { reportId: 'RPT-040', caseId: 'AE-040', title: 'Forensic Report — AE-040', severity: 'critical', classification: 'Microsoft credential harvesting', generatedAt: '2024-01-14T15:15:00Z', generatedBy: 'James Wilson' },
  { reportId: 'RPT-038', caseId: 'AE-038', title: 'Forensic Report — AE-038', severity: 'high', classification: 'BEC / Wire transfer fraud', generatedAt: '2024-01-13T11:48:00Z', generatedBy: 'Maria Lopez' },
  { reportId: 'RPT-036', caseId: 'AE-036', title: 'Forensic Report — AE-036', severity: 'high', classification: 'VPN credential phishing', generatedAt: '2024-01-12T16:22:00Z', generatedBy: 'James Wilson' },
  { reportId: 'RPT-033', caseId: 'AE-033', title: 'Forensic Report — AE-033', severity: 'medium', classification: 'Suspicious attachment delivery', generatedAt: '2024-01-10T09:05:00Z', generatedBy: 'Sarah Chen' },
];

export async function fetchReports(): Promise<Report[]> {
  if (useMock) {
    return mockReports.map((r) => ReportSchema.parse(r));
  }
  const { data } = await apiClient.get(ENDPOINTS.REPORTS_LIST);
  return (data as unknown[]).map((r) => ReportSchema.parse(r));
}

export async function generateReport(caseId: string): Promise<Report> {
  if (useMock) {
    await new Promise((r) => setTimeout(r, 1500));
    return ReportSchema.parse(mockReports[0]);
  }
  const { data } = await apiClient.post(ENDPOINTS.REPORTS_GENERATE, { caseId });
  return ReportSchema.parse(data);
}
