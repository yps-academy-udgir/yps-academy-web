import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface AttendanceRecord {
  studentId: string | { _id: string; firstName: string; lastName: string };
  classroomId: string;
  date: string;
  subject: string;
  status: 'present' | 'absent' | 'late';
}

export interface BulkAttendanceInput {
  studentId: string;
  status: 'present' | 'absent' | 'late';
}

export interface AttendanceSummaryRow {
  _id: string;
  total: number;
  present: number;
  absent: number;
  late: number;
  percentage: number;
  student?: { firstName: string; lastName: string };
}

@Injectable({ providedIn: 'root' })
export class AttendanceService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/attendance`;

  loading = signal(false);
  error = signal<string | null>(null);

  bulkMarkAttendance(
    classroomId: string,
    date: string,
    subject: string,
    records: BulkAttendanceInput[]
  ) {
    return this.http.post<{ data: any }>(`${this.base}/bulk`, {
      classroomId,
      date,
      subject,
      records,
    });
  }

  getAttendanceByClassroom(classroomId: string, date?: string, subject?: string) {
    let params = new HttpParams().set('classroomId', classroomId);
    if (date)    params = params.set('date', date);
    if (subject) params = params.set('subject', subject);
    return this.http.get<{ data: AttendanceRecord[] }>(this.base, { params });
  }

  getStudentAttendance(studentId: string, from?: string, to?: string) {
    let params = new HttpParams();
    if (from) params = params.set('from', from);
    if (to)   params = params.set('to', to);
    return this.http.get<{ data: { records: AttendanceRecord[]; summary: any } }>(
      `${this.base}/students/${studentId}`,
      { params }
    );
  }

  getAttendanceSummary(classroomId: string) {
    const params = new HttpParams().set('classroomId', classroomId);
    return this.http.get<{ data: AttendanceSummaryRow[] }>(`${this.base}/summary`, { params });
  }
}
