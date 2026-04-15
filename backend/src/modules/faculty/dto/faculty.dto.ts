import { z } from 'zod';

// Parses value if it arrives as a JSON string (multipart/form-data) or passes through if already an object
function parseJson<T extends z.ZodTypeAny>(schema: T) {
  return z.preprocess((val) => {
    if (typeof val === 'string') {
      try { return JSON.parse(val); } catch { return val; }
    }
    return val;
  }, schema);
}

const pastExperienceSchema = z.object({
  organization: z.string().trim().min(1, 'Organization is required'),
  role: z.string().trim().min(1, 'Role is required'),
  yearsOfExperience: z.coerce.number().min(0, 'Years of experience must be a non-negative number'),
});

const salaryPaymentSchema = z.object({
  date: z.string().refine(d => !isNaN(Date.parse(d)), { message: 'Payment date must be a valid date' }),
  amount: z.coerce.number().min(1, 'Payment amount must be greater than 0'),
  note: z.string().optional(),
});

export const createFacultySchema = z.object({
  firstName: z.string().trim().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().trim().min(2, 'Last name must be at least 2 characters'),
  email: z.string().trim().email('Valid email is required'),
  contact: z.string().trim().regex(/^\+?[\d\s-]{10,15}$/, 'Valid contact number is required (10-15 digits)'),
  department: z.enum(['Mathematics', 'Science', 'English'], { error: 'Department must be one of: Mathematics, Science, English' }),
  speciality: z.enum(['Mathematics', 'Science', 'English'], { error: 'Speciality must be one of: Mathematics, Science, English' }),
  degree: z.string().trim().min(2, 'Degree / qualification is required'),
  yearsOfExperience: z.coerce.number().min(0, 'Years of experience must be a non-negative number'),
  annualSalary: z.coerce.number().min(1, 'Annual salary must be greater than 0'),
  classroomId: z.string().trim().min(1, 'Classroom is required'),
  pastExperience: parseJson(z.array(pastExperienceSchema).optional().default([])),
  salaryPayments: parseJson(z.array(salaryPaymentSchema).optional().default([])),
});

export const updateFacultySchema = createFacultySchema.partial();

export const addSalaryPaymentSchema = z.object({
  date: z.string().refine(d => !isNaN(Date.parse(d)), { message: 'Payment date must be a valid date' }),
  amount: z.number().min(1, 'Payment amount must be greater than 0'),
  note: z.string().optional(),
});

export type CreateFacultyDto = z.infer<typeof createFacultySchema>;
export type UpdateFacultyDto = z.infer<typeof updateFacultySchema>;
export type AddSalaryPaymentDto = z.infer<typeof addSalaryPaymentSchema>;
