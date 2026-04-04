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

const academicDetailsSchema = z.object({
  yearOfAdmission: z.string().regex(/^\d{4}-\d{4}$/, 'Year of admission must be in format YYYY-YYYY (example: 2026-2027)'),
  class: z.enum(['5th', '6th', '7th', '8th', '9th', '10th']),
  subjects: z.array(z.string()).max(10).optional(),
  selfStudyMode: z.preprocess(
    (v) => (typeof v === 'string' ? v === 'true' : v),
    z.boolean().optional()
  ),
});

const feeDetailsSchema = z.object({
  totalFees: z.coerce.number().min(0).optional(),
  paidAmount: z.coerce.number().min(0).optional(),
  pendingFees: z.coerce.number().optional(),
  feeBreakdown: z.object({
    baseFeePerSubject: z.coerce.number().optional(),
    numberOfSubjects: z.coerce.number().optional(),
    subjectsFee: z.coerce.number().optional(),
    selfStudyFee: z.coerce.number().optional(),
    discount: z.coerce.number().min(0).optional(),
  }).optional(),
  discount: z.coerce.number().min(0).optional(),
  paymentHistory: z.array(z.object({
    amount: z.coerce.number().min(0),
    paymentDate: z.union([z.string(), z.date()]).optional(),
    paymentMethod: z.string().optional(),
    remarks: z.string().max(200).optional(),
  })).optional(),
}).optional();

export const createStudentSchema = z.object({
  firstName: z.string().trim().min(2, 'First name must be at least 2 characters').max(50),
  lastName: z.string().trim().min(2, 'Last name must be at least 2 characters').max(50),
  email: z.string().trim().email('Valid email is required'),
  contact: z.string().trim().regex(/^\+?[\d\s-]{10,15}$/, 'Valid contact number is required (10-15 digits)'),
  gender: z.enum(['male', 'female'], { error: 'Gender must be male or female' }),
  classroomId: z.string().optional(),
  academicDetails: parseJson(academicDetailsSchema),
  feeDetails: parseJson(feeDetailsSchema),
});

export const updateStudentSchema = createStudentSchema.partial();

export const addPaymentSchema = z.object({
  amount: z.number({ error: 'Amount is required' }).positive('Amount must be positive'),
  paymentMethod: z.string().optional(),
  remarks: z.string().max(200).optional(),
});

export type CreateStudentDto = z.infer<typeof createStudentSchema>;
export type UpdateStudentDto = z.infer<typeof updateStudentSchema>;
export type AddPaymentDto = z.infer<typeof addPaymentSchema>;
