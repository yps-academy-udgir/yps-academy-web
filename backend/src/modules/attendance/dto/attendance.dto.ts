import { z } from 'zod';

export const bulkAttendanceSchema = z.object({
  classroomId: z.string().min(1, 'classroomId is required'),
  date: z.string().refine(d => !isNaN(Date.parse(d)), { message: 'date must be a valid date string' }),
  subject: z.string().min(1, 'subject is required'),
  records: z.array(
    z.object({
      studentId: z.string().min(1, 'studentId is required'),
      status: z.enum(['present', 'absent', 'late']).optional().default('present'),
    })
  ).min(1, 'At least one record is required'),
});

export type BulkAttendanceDto = z.infer<typeof bulkAttendanceSchema>;
