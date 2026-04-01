import { ReportMeta } from './report-header.model';

/** A single payment transaction line. */
export interface FeeTransaction {
  receiptNo?: string;
  date: Date | string;
  amount: number;
  method: 'Cash' | 'Online' | 'Cheque' | 'UPI' | 'Other';
  remarks?: string;
}

/** Optional per-subject/type fee breakdown. */
export interface FeeBreakdownLine {
  label: string;
  amount: number;
}

/** The complete data structure driving the fee receipt component/print view. */
export interface FeeReceiptData {
  header: ReportMeta;

  // Receipt meta
  receiptNo: string;
  receiptDate: string;

  // Student info
  studentName: string;
  studentId: string;
  rollNumber?: string;
  class: string;
  section?: string;
  contact?: string;

  // Fee summary
  totalFees: number;
  paidAmount: number;
  pendingFees: number;
  breakdown?: FeeBreakdownLine[];

  // Transaction history
  transactions: FeeTransaction[];

  // Footer
  cashierName?: string;
  remarks?: string;
}
