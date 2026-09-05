import { z } from "zod";

export const ThreatIntelResultSchema = z.object({
  query: z.string(),
  queryType: z.enum(["ip", "domain", "url", "hash"]),
  reputationScore: z.number().min(0).max(100),
  verdict: z.enum(["malicious", "suspicious", "clean", "unknown"]),
  asn: z.string().nullable(),
  country: z.string().nullable(),
  firstSeen: z.string().nullable(),
  lastSeen: z.string().nullable(),
  categories: z.array(z.string()),
  relatedCases: z.array(
    z.object({
      caseId: z.string(),
      severity: z.enum(["low", "medium", "high", "critical"]),
      createdAt: z.string(),
    })
  ),
  sources: z.array(z.string()),
});

export type ThreatIntelResult = z.infer<typeof ThreatIntelResultSchema>;
