import { z } from 'zod';

// ===== Case schemas (§6) =====

export const CaseSeverity = z.enum(['low', 'medium', 'high', 'critical']);
export type CaseSeverity = z.infer<typeof CaseSeverity>;

export const CaseStatus = z.enum(['open', 'needs_review', 'confirmed', 'closed']);
export type CaseStatus = z.infer<typeof CaseStatus>;

export const GeoSchema = z.object({
  country: z.string().nullable(),
  city: z.string().nullable(),
  confidence: z.enum(['low', 'medium', 'high']),
  accuracyRadiusKm: z.number(),
});
export type Geo = z.infer<typeof GeoSchema>;

export const ExplanationSignal = z.object({
  signal: z.string(),
  weight: z.enum(['low', 'medium', 'high']),
});

export const AuthenticationResult = z.object({
  spf: z.enum(['pass', 'fail', 'none']),
  dkim: z.enum(['pass', 'fail', 'none']),
  dmarc: z.enum(['pass', 'fail', 'none']),
});

export const ReceivedHop = z.object({
  hop: z.number(),
  ip: z.string(),
  server: z.string().nullable(),
  geo: GeoSchema,
});

export const IOCItem = z.object({
  value: z.string(),
  risk: CaseSeverity,
  note: z.string().optional(),
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
  explanation: z.array(ExplanationSignal),
  authentication: AuthenticationResult,
  receivedPath: z.array(ReceivedHop),
  indicators: z.object({
    domains: z.array(IOCItem),
    urls: z.array(IOCItem),
    ips: z.array(IOCItem),
    attachments: z.array(IOCItem),
  }),
  timeline: z.array(z.object({ time: z.string(), event: z.string() })),
  notes: z.array(z.object({ author: z.string(), text: z.string(), createdAt: z.string() })),
});
export type Case = z.infer<typeof CaseSchema>;

// Lighter version for list views
export const CaseListItemSchema = z.object({
  caseId: z.string(),
  subject: z.string(),
  severity: CaseSeverity,
  status: CaseStatus,
  analyst: z.string().nullable(),
  createdAt: z.string(),
});
export type CaseListItem = z.infer<typeof CaseListItemSchema>;
