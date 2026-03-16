import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface FeeSummaryClass {
  class: string;
  totalFees: number;
  collected: number;
  pending: number;
  studentCount: number;
}

export interface FeeSummaryTotals {
  totalFees: number;
  collected: number;
  pending: number;
  studentCount: number;
}

export interface FeeSummary {
  byClass: FeeSummaryClass[];
  totals: FeeSummaryTotals;
}

export interface BackendFeeSummary {
  byClass: Record<string, Omit<FeeSummaryClass, 'class'>>;
  totals: FeeSummaryTotals;
}

export interface FeeDefaulter {
  _id: string;
  firstName: string;
  lastName: string;
  contact: string;
  academicDetails?: { class?: string };
  feeDetails: { totalFees: number; paidAmount: number; pendingFees: number };
}

@Injectable({ providedIn: 'root' })
export class FeeService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/students`;

  loading = signal(false);
  error = signal<string | null>(null);

  getFeesSummary() {
    this.loading.set(true);
    this.error.set(null);
    return this.http.get<{ data: BackendFeeSummary }>(`${this.base}/fees/summary`);
  }

  getFeeDefaulters() {
    this.loading.set(true);
    this.error.set(null);
    return this.http.get<{ data: FeeDefaulter[] }>(`${this.base}/fees/defaulters`);
  }

  addPayment(studentId: string, amount: number, method?: string, remarks?: string) {
    return this.http.post<{ data: any }>(`${this.base}/${studentId}/payments`, {
      amount,
      method,
      remarks,
    });
  }
}
