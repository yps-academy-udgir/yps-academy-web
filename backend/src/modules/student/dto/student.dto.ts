import { z } from 'zod';

const academicDetailsSchema = z.object({
  yearOfAdmission: z.number().int().min(1900).max(new Date().getFullYear() + 10).optional(),
  class: z.enum(['5th', '6th', '7th', '8th', '9th', '10th']).optional(),
  subjects: z.array(z.string()).max(10).optional(),
  selfStudyMode: z.boolean().optional(),
}).optional();

const feeDetailsSchema = z.object({
  totalFees: z.number().min(0).optional(),
  paidAmount: z.number().min(0).optional(),
  pendingFees: z.number().optional(),
  feeBreakdown: z.object({
    baseFeePerSubject: z.number().optional(),
    numberOfSubjects: z.number().optional(),
    subjectsFee: z.number().optional(),
    selfStudyFee: z.number().optional(),
  }).optional(),
  paymentHistory: z.array(z.object({
    amount: z.number().min(0),
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
  academicDetails: academicDetailsSchema,
  feeDetails: feeDetailsSchema,
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
