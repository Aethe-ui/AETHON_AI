import apiClient from "./apiClient";
import { CaseSchema, CaseSeverity, CaseStatus } from "../schemas/case";
import type { Case, CaseListItem } from "../types";

const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

export async function fetchCases(): Promise<CaseListItem[]> {
  if (USE_MOCK) {
    const data = await import("../../mock/cases.json");
    return data.default as CaseListItem[];
  }
  const res = await apiClient.get<CaseListItem[]>("/api/investigations");
  return res.data;
}

export async function fetchCase(caseId: string): Promise<Case> {
  if (USE_MOCK) {
    const data = await import("../../mock/case.json");
    return CaseSchema.parse(data.default);
  }
  const res = await apiClient.get(`/api/investigations/${caseId}`);
  return CaseSchema.parse(res.data);
}

export async function analyzeEmail(formData: FormData): Promise<{ caseId: string }> {
  if (USE_MOCK) {
    // Simulate analysis delay then return a mock case ID
    await new Promise((r) => setTimeout(r, 2500));
    return { caseId: "AE-042" };
  }
  const res = await apiClient.post<{ caseId: string }>("/api/emails/analyze", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

export async function submitAnalystAction(
  caseId: string,
  action: { action: string; note?: string }
) {
  if (USE_MOCK) return { success: true };
  const res = await apiClient.patch(`/api/investigations/${caseId}/action`, action);
  return res.data;
}

// Suppress unused import warning when not used in mock mode
void CaseSeverity;
void CaseStatus;
