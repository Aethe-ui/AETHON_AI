import { z } from 'zod';

export const ReportSchema = z.object({
  reportId: z.string(),
  caseId: z.string(),
  title: z.string(),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  classification: z.string(),
  generatedAt: z.string(),
  generatedBy: z.string(),
  downloadUrl: z.string().optional(),
});
export type Report = z.infer<typeof ReportSchema>;
