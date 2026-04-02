import { Injectable, inject } from '@angular/core';
import { Faculty } from '../../features/faculty/models/faculty.model';
import {
  FacultyPaymentReceiptData,
  FacultyPaymentTransaction,
} from '../models/faculty-payment-receipt.model';
import { ReportHeaderService } from './report-header.service';

@Injectable({ providedIn: 'root' })
export class FacultyPaymentReceiptService {
  private reportHeaderService = inject(ReportHeaderService);

  buildReceipt(
    faculty: Faculty,
    options: { cashierName?: string; remarks?: string; receiptNo?: string } = {},
  ): FacultyPaymentReceiptData {
    const transactions: FacultyPaymentTransaction[] = (faculty.salaryPayments ?? []).map((payment, index) => ({
      receiptNo: this.padReceiptNo(index + 1),
      date: payment.date,
      amount: payment.amount,
      note: payment.note,
    }));

    const totalPaid = transactions.reduce((sum, txn) => sum + txn.amount, 0);
    const annualSalary = faculty.annualSalary ?? 0;

    return {
      header: this.reportHeaderService.buildFacultyPaymentReceiptMeta(),
      receiptNo: options.receiptNo ?? this.generateReceiptNo(faculty._id),
      receiptDate: new Date().toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
      facultyName: `${faculty.firstName} ${faculty.lastName}`,
      facultyId: faculty.userId ?? faculty._id ?? '',
      department: faculty.department,
      speciality: faculty.speciality,
      degree: faculty.degree,
      email: faculty.email,
      contact: faculty.contact,
      annualSalary,
      totalPaid,
      remainingBalance: annualSalary - totalPaid,
      transactions,
      cashierName: options.cashierName,
      remarks: options.remarks,
    };
  }

  generateReceiptNo(facultyId?: string): string {
    const idFragment = (facultyId ?? 'FAC').slice(-4).toUpperCase();
    const ts = Date.now().toString().slice(-6);
    return `SAL-${idFragment}-${ts}`;
  }

  private padReceiptNo(index: number): string {
    return `PAY-${String(index).padStart(4, '0')}`;
  }
}
