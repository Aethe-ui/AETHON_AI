import { z } from "zod";

export const DashboardStatsSchema = z.object({
  emailsAnalyzed: z.number(),
  threatsDetected: z.number(),
  criticalThreats: z.number(),
  openCases: z.number(),
  emailsAnalyzedTrend: z.number().optional(),
  threatsDetectedTrend: z.number().optional(),
  criticalThreatsTrend: z.number().optional(),
  openCasesTrend: z.number().optional(),
  detectionTrend: z.array(
    z.object({
      date: z.string(),
      total: z.number(),
      threats: z.number(),
    })
  ),
  categoryBreakdown: z.array(
    z.object({
      category: z.string(),
      count: z.number(),
    })
  ),
});

export type DashboardStats = z.infer<typeof DashboardStatsSchema>;
