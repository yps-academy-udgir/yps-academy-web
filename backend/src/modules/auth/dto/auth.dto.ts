import { z } from 'zod';

export const loginSchema = z.object({
  userId: z.string().min(1, 'userId is required'),
  password: z.string().min(1, 'password is required'),
  role: z.enum(['admin', 'faculty', 'student'], { error: 'Invalid role. Must be admin, faculty or student' }),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
});

export const resetPasswordSchema = z.object({
  entityId: z.string().min(1, 'entityId is required'),
  role: z.enum(['faculty', 'student'], { error: 'Role must be faculty or student' }),
});

export type LoginDto = z.infer<typeof loginSchema>;
export type ChangePasswordDto = z.infer<typeof changePasswordSchema>;
export type ResetPasswordDto = z.infer<typeof resetPasswordSchema>;

