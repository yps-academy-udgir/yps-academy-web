import { z } from 'zod';

export const loginSchema = z.object({
  userId: z.string().min(1, 'userId is required'),
  password: z.string().min(1, 'password is required'),
  role: z.enum(['admin', 'faculty', 'student'], { error: 'Invalid role. Must be admin, faculty or student' }),
});

export type LoginDto = z.infer<typeof loginSchema>;
