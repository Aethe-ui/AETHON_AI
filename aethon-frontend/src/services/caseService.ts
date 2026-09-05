import apiClient from './apiClient';
import { ENDPOINTS } from '@/api/endpoints';
import { CaseSchema, CaseListItemSchema, type Case, type CaseListItem } from '@/schemas/case';
import caseMock from '../../mock/case.json';
import casesMock from '../../mock/cases.json';

const useMock = import.meta.env.VITE_USE_MOCK === 'true';

export async function fetchCases(): Promise<CaseListItem[]> {
  if (useMock) {
    return casesMock.map((c) => CaseListItemSchema.parse(c));
  }
  const { data } = await apiClient.get(ENDPOINTS.INVESTIGATIONS);
  return (data as unknown[]).map((c) => CaseListItemSchema.parse(c));
}

export async function fetchCase(caseId: string): Promise<Case> {
  if (useMock) {
    // In mock mode, always return the sample case
    return CaseSchema.parse(caseMock);
  }
  const { data } = await apiClient.get(ENDPOINTS.INVESTIGATION_BY_ID(caseId));
  return CaseSchema.parse(data);
}

export async function analyzeEmail(formData: FormData): Promise<{ caseId: string }> {
  if (useMock) {
    // Simulate analysis delay
    await new Promise((r) => setTimeout(r, 3000));
    return { caseId: 'AE-042' };
  }
  const { data } = await apiClient.post(ENDPOINTS.EMAILS_ANALYZE, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export async function updateCaseStatus(caseId: string, status: string, notes?: string): Promise<void> {
  if (useMock) return;
  await apiClient.patch(ENDPOINTS.INVESTIGATION_BY_ID(caseId), { status, notes });
}
