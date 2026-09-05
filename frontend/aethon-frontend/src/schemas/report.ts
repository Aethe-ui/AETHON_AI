import { z } from "zod";

export const ReportSchema = z.object({
  reportId: z.string(),
  caseId: z.string(),
  title: z.string(),
  generatedAt: z.string().datetime(),
  generatedBy: z.string(),
  status: z.enum(["generating", "ready", "failed"]),
  downloadUrl: z.string().nullable(),
  summary: z.string().optional(),
});

export const ReportListSchema = z.array(ReportSchema);

export type Report = z.infer<typeof ReportSchema>;
