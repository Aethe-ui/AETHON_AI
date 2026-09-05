import { z } from 'zod';

export const DashboardStatsSchema = z.object({
  emailsAnalyzed: z.number(),
  emailsTrend: z.number(), // percentage change
  threatsDetected: z.number(),
  threatsTrend: z.number(),
  criticalThreats: z.number(),
  criticalTrend: z.number(),
  openCases: z.number(),
  openCasesTrend: z.number(),
});
export type DashboardStats = z.infer<typeof DashboardStatsSchema>;

export const TrendDataPointSchema = z.object({
  date: z.string(),
  count: z.number(),
});
export type TrendDataPoint = z.infer<typeof TrendDataPointSchema>;

export const CategoryBreakdownSchema = z.object({
  category: z.string(),
  count: z.number(),
  percentage: z.number(),
});
export type CategoryBreakdown = z.infer<typeof CategoryBreakdownSchema>;

export const DashboardDataSchema = z.object({
  stats: DashboardStatsSchema,
  trend: z.array(TrendDataPointSchema),
  categories: z.array(CategoryBreakdownSchema),
});
export type DashboardData = z.infer<typeof DashboardDataSchema>;
