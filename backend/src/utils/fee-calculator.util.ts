/**
 * Fee Calculator Utility
 * Handles fee calculations based on subjects and self-study mode.
 * Fees are looked up from SubjectConfig (dynamic) instead of a hardcoded structure.
 */

import { IFeeBreakdown, IFeeDetails, IAcademicDetails } from '../models/student.model';

export function calculateFees(
  academicDetails: IAcademicDetails | undefined,
  subjectFeeMap: Record<string, number>,
  selfStudyFee: number,
  discount: number = 0
): IFeeBreakdown {
  const zero: IFeeBreakdown = { baseFeePerSubject: 0, numberOfSubjects: 0, subjectsFee: 0, selfStudyFee: 0, discount: 0 };

  if (!academicDetails?.subjects?.length) return zero;

  const subjects = academicDetails.subjects;
  const selfStudyMode = academicDetails.selfStudyMode || false;

  // Sum per-subject fees; unknown subjects default to 0
  const subjectsFee = subjects.reduce((sum, name) => sum + (subjectFeeMap[name] ?? 0), 0);
  const numberOfSubjects = subjects.length;
  // baseFeePerSubject: average (kept for UI display)
  const baseFeePerSubject = numberOfSubjects > 0 ? Math.round(subjectsFee / numberOfSubjects) : 0;

  return {
    baseFeePerSubject,
    numberOfSubjects,
    subjectsFee,
    selfStudyFee: selfStudyMode ? selfStudyFee : 0,
    discount: Math.max(0, discount),
  };
}

export function calculateTotalPaid(payments: Array<{ amount: number }>): number {
  return payments.reduce((sum, p) => sum + p.amount, 0);
}

export function calculateFeeDetails(
  academicDetails: IAcademicDetails | undefined,
  existingFeeDetails: Partial<IFeeDetails> | undefined,
  subjectFeeMap: Record<string, number>,
  selfStudyFee: number,
  discount: number = 0
): IFeeDetails {
  const feeBreakdown = calculateFees(academicDetails, subjectFeeMap, selfStudyFee, discount);
  const totalFees = Math.max(0, feeBreakdown.subjectsFee + feeBreakdown.selfStudyFee - feeBreakdown.discount);
  const paymentHistory = existingFeeDetails?.paymentHistory || [];
  const paidAmount = calculateTotalPaid(paymentHistory);
  const pendingFees = Math.max(0, totalFees - paidAmount);

  return { totalFees, paidAmount, pendingFees, feeBreakdown, paymentHistory };
}
