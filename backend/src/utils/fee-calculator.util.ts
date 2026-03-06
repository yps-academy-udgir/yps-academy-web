/**
 * Fee Calculator Utility
 * Handles fee calculations based on class, subjects, and self-study mode
 * Backend implementation
 */

import { Class, IFeeBreakdown, IFeeDetails, IAcademicDetails } from '../models/student.model';

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
 * Calculate total fees based on academic details
 */
export function calculateFees(
  academicDetails?: IAcademicDetails
): IFeeBreakdown {
  // Default values
  const result: IFeeBreakdown = {
    baseFeePerSubject: 0,
    numberOfSubjects: 0,
    subjectsFee: 0,
    selfStudyFee: 0,
  };

  // If no academic details or no subjects, return 0
  if (!academicDetails || !academicDetails.subjects || academicDetails.subjects.length === 0) {
    return result;
  }

  const studentClass = academicDetails.class;
  const subjects = academicDetails.subjects;
  const selfStudyMode = academicDetails.selfStudyMode || false;

  // Get base fee per subject for the class
  const baseFeePerSubject = studentClass ? FEE_STRUCTURE[studentClass] || 0 : 0;
  const numberOfSubjects = subjects.length;

  // Calculate subjects fee
  const subjectsFee = baseFeePerSubject * numberOfSubjects;

  // Calculate self-study fee
  const selfStudyFee = selfStudyMode ? SELF_STUDY_FEE : 0;

  return {
    baseFeePerSubject,
    numberOfSubjects,
    subjectsFee,
    selfStudyFee,
  };
}

/**
 * Calculate total paid amount from payment history
 */
export function calculateTotalPaid(payments: Array<{ amount: number }>): number {
  return payments.reduce((sum, payment) => sum + payment.amount, 0);
}

/**
 * Calculate complete fee details
 */
export function calculateFeeDetails(
  academicDetails?: IAcademicDetails,
  existingFeeDetails?: Partial<IFeeDetails>
): IFeeDetails {
  // Calculate fee breakdown
  const feeBreakdown = calculateFees(academicDetails);
  
  // Calculate total fees
  const totalFees = feeBreakdown.subjectsFee + feeBreakdown.selfStudyFee;

  // Get payment history (preserve existing or create new)
  const paymentHistory = existingFeeDetails?.paymentHistory || [];

  // Calculate paid amount
  const paidAmount = calculateTotalPaid(paymentHistory);

  // Calculate pending fees
  const pendingFees = Math.max(0, totalFees - paidAmount);

  return {
    totalFees,
    paidAmount,
    pendingFees,
    feeBreakdown,
    paymentHistory,
  };
}
