// Re-export all inferred types from schemas for use in component props
export type { Case, CaseSeverityType, CaseStatusType, Geo } from "../schemas/case";
export type { DashboardStats } from "../schemas/dashboardStats";
export type { ThreatIntelResult } from "../schemas/threatIntel";
export type { Report } from "../schemas/report";

// Lightweight types used across multiple components
export interface CaseListItem {
  caseId: string;
  subject?: string;
  severity: "low" | "medium" | "high" | "critical";
  status: "open" | "needs_review" | "confirmed" | "closed";
  analyst: string | null;
  createdAt: string;
  riskScore: number;
  classification: string;
}

export interface PipelineStep {
  id: string;
  label: string;
  status: "pending" | "running" | "done" | "error";
}

export interface AnalystAction {
  action: "confirm" | "mark_safe" | "needs_review";
  note?: string;
}
