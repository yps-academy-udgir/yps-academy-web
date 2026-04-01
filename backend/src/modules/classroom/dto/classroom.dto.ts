import { z } from 'zod';

const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId');

export const createClassroomSchema = z.object({
  class: z.enum(['5th', '6th', '7th', '8th', '9th', '10th'], { error: 'Class must be one of: 5th, 6th, 7th, 8th, 9th, 10th' }),
  section: z.string().trim().regex(/^[A-Za-z]$/, 'Section must be a single letter (A-Z)'),
  roomNumber: z.string().trim().min(1, 'Room number is required'),
  capacity: z.number().int().min(1, 'Capacity must be at least 1'),
  academicYear: z.string().regex(/^\d{4}-\d{4}$/, 'Academic year must be in YYYY-YYYY format (e.g., 2025-2026)'),
});

export const updateClassroomSchema = createClassroomSchema.partial();

export const assignFacultySchema = z.object({
  facultyId: objectIdSchema,
  subject: z.enum(['Mathematics', 'Science', 'English'], { error: 'Subject must be one of: Mathematics, Science, English' }),
  isPrimary: z.boolean().optional().default(false),
});

export const enrollStudentSchema = z.object({
  studentId: objectIdSchema,
});

const scheduleSlotSchema = z.object({
  day: z.enum(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']),
  period: z.number().int().min(1).max(8),
  subject: z.enum(['Mathematics', 'Science', 'English']),
  facultyId: objectIdSchema,
  startTime: z.string(),
  endTime: z.string(),
});

export const updateScheduleSchema = z.object({
  schedule: z.array(scheduleSlotSchema),
});

export type CreateClassroomDto = z.infer<typeof createClassroomSchema>;
export type UpdateClassroomDto = z.infer<typeof updateClassroomSchema>;
export type AssignFacultyDto = z.infer<typeof assignFacultySchema>;
export type EnrollStudentDto = z.infer<typeof enrollStudentSchema>;
export type UpdateScheduleDto = z.infer<typeof updateScheduleSchema>;
