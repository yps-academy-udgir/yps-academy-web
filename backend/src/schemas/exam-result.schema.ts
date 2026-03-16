import { z } from 'zod';

const subjectMarkInputSchema = z.object({
  subject: z.string().min(1),
  outOf: z.number().int().min(1),
  marksObtained: z.number().min(0),
}).refine((d: { marksObtained: number; outOf: number }) => d.marksObtained <= d.outOf, { message: 'marksObtained cannot exceed outOf' });

export const bulkExamResultSchema = z.object({
  classroomId: z.string().min(1, 'classroomId is required'),
  examType: z.enum(['Monthly Test', 'Quarterly', 'Half-yearly', 'Annual']),
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2000),
  records: z.array(z.object({
    studentId: z.string().min(1),
    subjectMarks: z.array(subjectMarkInputSchema).min(1),
  })).min(1, 'At least one student record is required'),
});

export type BulkExamResultInput = z.infer<typeof bulkExamResultSchema>;
