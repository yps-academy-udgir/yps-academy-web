import { z } from 'zod';

const subjectEntrySchema = z.object({
  name: z.string().trim().min(1, 'Subject name is required').max(100),
  fee: z.number().min(0, 'Fee must be non-negative'),
  isActive: z.boolean().default(true),
});

const classSubjectEntrySchema = z.object({
  className: z.string().trim().min(1, 'Class name is required'),
  subjects: z.array(subjectEntrySchema),
});

export const updateSubjectConfigSchema = z.object({
  classSubjects: z.array(classSubjectEntrySchema).min(1, 'At least one class entry is required'),
  selfStudyFee: z.number().min(0, 'Self-study fee must be non-negative'),
});

export type UpdateSubjectConfigDto = z.infer<typeof updateSubjectConfigSchema>;
