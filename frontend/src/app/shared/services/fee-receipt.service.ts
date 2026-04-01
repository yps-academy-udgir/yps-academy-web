import { Injectable, inject } from '@angular/core';
import { Student } from '../models/student.model';
import { FeeBreakdownLine, FeeReceiptData, FeeTransaction } from '../models/fee-receipt.model';
import { ReportHeaderService } from './report-header.service';

@Injectable({ providedIn: 'root' })
export class FeeReceiptService {
  private reportHeaderService = inject(ReportHeaderService);

  /**
   * Build a complete FeeReceiptData object from a Student record.
   * Pass optional overrides for cashierName / remarks / custom receiptNo.
   */
  buildReceipt(
    student: Student,
    options: { cashierName?: string; remarks?: string; receiptNo?: string } = {},
  ): FeeReceiptData {
    const feeDetails = student.feeDetails;
    const academic = student.academicDetails;

    const transactions: FeeTransaction[] = (feeDetails?.paymentHistory ?? []).map((p, i) => ({
      receiptNo: this.padReceiptNo(i + 1),
      date: p.paymentDate,
      amount: p.amount,
      method: this.normaliseMethod(p.paymentMethod),
      remarks: p.remarks,
    }));

    const breakdown = this.buildBreakdown(feeDetails?.feeBreakdown);

    return {
      header: this.reportHeaderService.buildFeeReceiptMeta(),
      receiptNo: options.receiptNo ?? this.generateReceiptNo(student._id),
      receiptDate: new Date().toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
      studentName: `${student.firstName} ${student.lastName}`,
      studentId: student._id ?? '',
      rollNumber: student.rollNumber,
      class: academic?.class ?? '',
      contact: student.contact,
      totalFees: feeDetails?.totalFees ?? 0,
      paidAmount: feeDetails?.paidAmount ?? 0,
      pendingFees: feeDetails?.pendingFees ?? 0,
      breakdown,
      transactions,
      cashierName: options.cashierName,
      remarks: options.remarks,
    };
  }

  /** Generate a deterministic receipt number from a student ID and current timestamp. */
  generateReceiptNo(studentId?: string): string {
    const idFragment = (studentId ?? 'STU').slice(-4).toUpperCase();
    const ts = Date.now().toString().slice(-6);
    return `RCP-${idFragment}-${ts}`;
  }

  private padReceiptNo(index: number): string {
    return `TXN-${String(index).padStart(4, '0')}`;
  }

  private normaliseMethod(method?: string): FeeTransaction['method'] {
    const known: FeeTransaction['method'][] = ['Cash', 'Online', 'Cheque', 'UPI', 'Other'];
    const match = known.find(m => m.toLowerCase() === (method ?? '').toLowerCase());
    return match ?? 'Other';
  }

  private buildBreakdown(breakdown?: {
    baseFeePerSubject?: number;
    numberOfSubjects?: number;
    subjectsFee?: number;
    selfStudyFee?: number;
  }): FeeBreakdownLine[] | undefined {
    if (!breakdown) return undefined;
    const lines: FeeBreakdownLine[] = [];
    if (breakdown.subjectsFee != null) {
      lines.push({ label: `Subjects Fee (${breakdown.numberOfSubjects} × ₹${breakdown.baseFeePerSubject})`, amount: breakdown.subjectsFee });
    }
    if (breakdown.selfStudyFee != null && breakdown.selfStudyFee > 0) {
      lines.push({ label: 'Self-Study Supplement', amount: breakdown.selfStudyFee });
    }
    return lines.length ? lines : undefined;
  }
}
