/**
 * Fee Calculator Utility
 * Dynamic: fees come from SubjectConfig (per-subject), not hardcoded class structure.
 */

export interface FeeCalculationResult {
  baseFeePerSubject: number;
  numberOfSubjects: number;
  subjectsFee: number;
  selfStudyFee: number;
  discount: number;
  totalFees: number;
}

export function calculateFees(
  subjects: string[] | undefined,
  selfStudyMode: boolean = false,
  subjectFeeMap: Record<string, number> = {},
  selfStudyFee: number = 0,
  discount: number = 0
): FeeCalculationResult {
  const zero: FeeCalculationResult = { baseFeePerSubject: 0, numberOfSubjects: 0, subjectsFee: 0, selfStudyFee: 0, discount: 0, totalFees: 0 };

  if (!subjects?.length) return zero;

  const subjectsFee = subjects.reduce((sum, name) => sum + (subjectFeeMap[name] ?? 0), 0);
  const numberOfSubjects = subjects.length;
  const baseFeePerSubject = numberOfSubjects > 0 ? Math.round(subjectsFee / numberOfSubjects) : 0;
  const selfStudyFeeAmount = selfStudyMode ? selfStudyFee : 0;
  const discountAmount = Math.max(0, discount);
  const totalFees = Math.max(0, subjectsFee + selfStudyFeeAmount - discountAmount);

  return { baseFeePerSubject, numberOfSubjects, subjectsFee, selfStudyFee: selfStudyFeeAmount, discount: discountAmount, totalFees };
}

export function calculatePendingFees(totalFees: number, paidAmount: number): number {
  return Math.max(0, totalFees - paidAmount);
}

export function calculateTotalPaid(payments: Array<{ amount: number }>): number {
  return payments.reduce((sum, payment) => sum + payment.amount, 0);
}
