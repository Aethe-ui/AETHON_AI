import apiClient from "./apiClient";
import { ReportListSchema } from "../schemas/report";
import type { Report } from "../types";

const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

export async function fetchReports(): Promise<Report[]> {
  if (USE_MOCK) {
    return ReportListSchema.parse([
      {
        reportId: "RPT-001",
        caseId: "AE-042",
        title: "Phishing Analysis Report — AE-042",
        generatedAt: "2026-09-04T18:30:00.000Z",
        generatedBy: "SOC Analyst",
        status: "ready",
        downloadUrl: "/mock/report-ae042.pdf",
        summary: "High-risk credential phishing targeting finance team.",
      },
      {
        reportId: "RPT-002",
        caseId: "AE-038",
        title: "Malware Delivery Report — AE-038",
        generatedAt: "2026-09-03T10:15:00.000Z",
        generatedBy: "SOC Analyst",
        status: "ready",
        downloadUrl: "/mock/report-ae038.pdf",
        summary: "Malicious macro attachment with C2 callback.",
      },
    ]);
  }
  const res = await apiClient.get("/api/reports");
  return ReportListSchema.parse(res.data);
}

export async function generateReport(caseId: string): Promise<Report> {
  if (USE_MOCK) {
    return {
      reportId: `RPT-NEW-${Date.now()}`,
      caseId,
      title: `Forensic Report — ${caseId}`,
      generatedAt: new Date().toISOString(),
      generatedBy: "SOC Analyst",
      status: "generating",
      downloadUrl: null,
    };
  }
  const res = await apiClient.post("/api/reports/generate", { caseId });
  return res.data;
}
