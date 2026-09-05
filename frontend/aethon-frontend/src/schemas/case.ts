import { z } from "zod";

export const CaseSeverity = z.enum(["low", "medium", "high", "critical"]);
export const CaseStatus = z.enum(["open", "needs_review", "confirmed", "closed"]);

export const GeoSchema = z.object({
  country: z.string().nullable(),
  city: z.string().nullable(),
  confidence: z.enum(["low", "medium", "high"]),
  accuracyRadiusKm: z.number(),
  lat: z.number().optional(),
  lon: z.number().optional(),
});

export const CaseSchema = z.object({
  caseId: z.string(),
  subject: z.string().optional(),
  status: CaseStatus,
  severity: CaseSeverity,
  riskScore: z.number().min(0).max(100),
  confidence: z.number().min(0).max(1),
  classification: z.string(),
  createdAt: z.string().datetime(),
  analyst: z.string().nullable(),
  explanation: z.array(
    z.object({ signal: z.string(), weight: z.enum(["low", "medium", "high"]) })
  ),
  authentication: z.object({
    spf: z.enum(["pass", "fail", "none"]),
    dkim: z.enum(["pass", "fail", "none"]),
    dmarc: z.enum(["pass", "fail", "none"]),
  }),
  receivedPath: z.array(
    z.object({
      hop: z.number(),
      ip: z.string(),
      server: z.string().nullable(),
      geo: GeoSchema,
    })
  ),
  indicators: z.object({
    domains: z.array(
      z.object({ value: z.string(), risk: CaseSeverity, note: z.string().optional() })
    ),
    urls: z.array(z.object({ value: z.string(), risk: CaseSeverity })),
    ips: z.array(z.object({ value: z.string(), risk: CaseSeverity })),
    attachments: z.array(z.object({ value: z.string(), risk: CaseSeverity })),
  }),
  timeline: z.array(z.object({ time: z.string(), event: z.string() })),
  notes: z.array(
    z.object({ author: z.string(), text: z.string(), createdAt: z.string() })
  ),
  senderEmail: z.string().optional(),
  senderDomain: z.string().optional(),
});

export type Case = z.infer<typeof CaseSchema>;
export type CaseSeverityType = z.infer<typeof CaseSeverity>;
export type CaseStatusType = z.infer<typeof CaseStatus>;
export type Geo = z.infer<typeof GeoSchema>;
