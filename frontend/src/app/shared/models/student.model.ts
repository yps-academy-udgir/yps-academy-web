/**
 * Student Model
 * Simplified student data structure
 * Matches backend Student schema
 */

/**
 * Class enum
 */
export enum Class {
  FIFTH = '5th',
  SIXTH = '6th',
  SEVENTH = '7th',
  EIGHTH = '8th',
  NINTH = '9th',
  TENTH = '10th',
}

/**
 * Available subjects
 */
export enum Subject {
  MATHEMATICS = 'Mathematics',
  SCIENCE = 'Science',
  ENGLISH = 'English',
}

/**
 * Academic Details Interface
 */
export interface AcademicDetails {
  yearOfAdmission?: number;
  class?: Class;
  subjects?: string[];
  selfStudyMode?: boolean;
}

/**
 * Payment History Interface
 */
export interface Payment {
  amount: number;
  paymentDate: Date;
  paymentMethod?: string;
  remarks?: string;
}

/**
 * Fee Breakdown Interface
 */
export interface FeeBreakdown {
  baseFeePerSubject: number;
  numberOfSubjects: number;
  subjectsFee: number;
  selfStudyFee: number;
}

/**
 * Fee Details Interface
 */
export interface FeeDetails {
  totalFees: number;
  paidAmount: number;
  pendingFees: number;
  feeBreakdown?: FeeBreakdown;
  paymentHistory: Payment[];
}

export interface Student {
  _id?: string;
  firstName: string;
  lastName: string;
  email: string;
  contact: string;
  gender: 'male' | 'female';
  academicDetails?: AcademicDetails;
  feeDetails?: FeeDetails;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * API Response wrapper
 * Standardized response format from backend
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  details?: any;
}

/**
 * Paginated API Response
 * Used for list endpoints with pagination
 */
export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

/**
 * Gender enum
 */
export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
}
