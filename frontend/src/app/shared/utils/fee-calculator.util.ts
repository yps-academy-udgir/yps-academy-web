/**
 * Fee Calculator Utility
 * Handles fee calculations based on class, subjects, and self-study mode
 */

import { Class } from '../models/student.model';

/**
 * Fee structure per class (per subject)
 * Hardcoded as per requirements
 */
export const FEE_STRUCTURE: Record<Class, number> = {
  [Class.FIFTH]: 5000,
  [Class.SIXTH]: 5500,
  [Class.SEVENTH]: 6000,
  [Class.EIGHTH]: 6500,
  [Class.NINTH]: 7000,
  [Class.TENTH]: 7500,
};

/**
 * Self-study mode additional fee
 */
export const SELF_STUDY_FEE = 8000;

/**
 * Calculate fee breakdown
 */
export interface FeeCalculationResult {
  baseFeePerSubject: number;
  numberOfSubjects: number;
  subjectsFee: number;
  selfStudyFee: number;
  totalFees: number;
}

/**
 * Calculate total fees based on class, subjects, and self-study mode
 */
export function calculateFees(
  studentClass: Class | string | undefined,
  subjects: string[] | undefined,
  selfStudyMode: boolean = false
): FeeCalculationResult {
  // Default values
  const result: FeeCalculationResult = {
    baseFeePerSubject: 0,
    numberOfSubjects: 0,
    subjectsFee: 0,
    selfStudyFee: 0,
    totalFees: 0,
  };

  // If no class or no subjects, return 0
  if (!studentClass || !subjects || subjects.length === 0) {
    return result;
  }

  // Get base fee per subject for the class
  const baseFeePerSubject = FEE_STRUCTURE[studentClass as Class] || 0;
  const numberOfSubjects = subjects.length;

  // Calculate subjects fee
  const subjectsFee = baseFeePerSubject * numberOfSubjects;

  // Calculate self-study fee
  const selfStudyFee = selfStudyMode ? SELF_STUDY_FEE : 0;

  // Calculate total
  const totalFees = subjectsFee + selfStudyFee;

  return {
    baseFeePerSubject,
    numberOfSubjects,
    subjectsFee,
    selfStudyFee,
    totalFees,
  };
}

/**
 * Calculate pending fees
 */
export function calculatePendingFees(totalFees: number, paidAmount: number): number {
  return Math.max(0, totalFees - paidAmount);
}

/**
 * Calculate total paid amount from payment history
 */
export function calculateTotalPaid(payments: Array<{ amount: number }>): number {
  return payments.reduce((sum, payment) => sum + payment.amount, 0);
}
