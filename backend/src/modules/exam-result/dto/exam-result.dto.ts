import { z } from 'zod';

const subjectMarkSchema = z.object({
  subject: z.string().min(1),
  outOf: z.number().int().min(1),
  marksObtained: z.number().min(0),
}).refine(d => d.marksObtained <= d.outOf, { message: 'marksObtained cannot exceed outOf' });

const examTypeEnum = z.enum(['Monthly Test', 'Quarterly', 'Half-yearly', 'Annual']);

export const createExamResultSchema = z.object({
  studentId: z.string().min(1, 'studentId is required'),
  examType: examTypeEnum,
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2000),
  subjectMarks: z.array(subjectMarkSchema).min(1, 'At least one subject mark is required'),
});

export const updateExamResultSchema = createExamResultSchema.omit({ studentId: true }).partial();

export const bulkExamResultSchema = z.object({
  classroomId: z.string().min(1, 'classroomId is required'),
  examType: examTypeEnum,
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2000),
  records: z.array(
    z.object({
      studentId: z.string().min(1),
      subjectMarks: z.array(subjectMarkSchema).min(1),
    })
  ).min(1, 'At least one student record is required'),
});

export type CreateExamResultDto = z.infer<typeof createExamResultSchema>;
export type UpdateExamResultDto = z.infer<typeof updateExamResultSchema>;
export type BulkExamResultDto = z.infer<typeof bulkExamResultSchema>;
