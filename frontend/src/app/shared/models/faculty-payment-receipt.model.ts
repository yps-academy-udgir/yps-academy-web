import { ReportMeta } from './report-header.model';

export interface FacultyPaymentTransaction {
  receiptNo?: string;
  date: Date | string;
  amount: number;
  note?: string;
}

export interface FacultyPaymentReceiptData {
  header: ReportMeta;

  receiptNo: string;
  receiptDate: string;

  facultyName: string;
  facultyId: string;
  department: string;
  speciality: string;
  degree?: string;
  email?: string;
  contact?: string;

  annualSalary: number;
  totalPaid: number;
  remainingBalance: number;

  transactions: FacultyPaymentTransaction[];

  cashierName?: string;
  remarks?: string;
}
