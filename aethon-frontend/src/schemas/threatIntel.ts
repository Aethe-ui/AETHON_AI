import { z } from 'zod';

export const ThreatIntelResultSchema = z.object({
  query: z.string(),
  queryType: z.enum(['ip', 'domain', 'url', 'hash']),
  reputationScore: z.number().min(0).max(100),
  classification: z.string(),
  threatType: z.string().nullable(),
  firstSeen: z.string().nullable(),
  lastSeen: z.string().nullable(),
  tags: z.array(z.string()),
  network: z.object({
    asn: z.string().nullable(),
    country: z.string().nullable(),
    city: z.string().nullable(),
    organization: z.string().nullable(),
    cidr: z.string().nullable(),
  }),
  detectionStats: z.object({
    detected: z.number(),
    total: z.number(),
    categories: z.array(z.object({
      name: z.string(),
      count: z.number(),
    })),
  }),
  relatedCases: z.array(z.object({
    caseId: z.string(),
    severity: z.enum(['low', 'medium', 'high', 'critical']),
    classification: z.string(),
    date: z.string(),
  })),
});
export type ThreatIntelResult = z.infer<typeof ThreatIntelResultSchema>;
