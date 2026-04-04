import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ExamResult, ExamType, SubjectMark, ApiResponse } from '../models/student.model';
import { environment } from '../../../environments/environment';

export interface BulkMarksRecord {
  studentId: string;
  subjectMarks: SubjectMark[];
}

export interface BulkMarksPayload {
  classroomId: string;
  examType: ExamType;
  month: number;
  year: number;
  records: BulkMarksRecord[];
}

export interface FilteredExamResultRow {
  _id: string;
  studentId: string;
  studentName: string;
  studentImage?: string | null;
  class: string;
  section: string;
  roomNumber: string;
  examType: ExamType;
  month: number;
  year: number;
  subjectMarks: SubjectMark[];
  totalMarksObtained: number;
  totalOutOf: number;
  percentage: number;
}

export interface FilteredResultsQuery {
  classValue: string;
  section?: string;
  examType?: ExamType;
  month?: number;
  year?: number;
}

@Injectable({ providedIn: 'root' })
export class ExamResultService {
  private http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/exam-results`;

  getByStudent(studentId: string): Observable<ApiResponse<ExamResult[]>> {
    const params = new HttpParams().set('studentId', studentId);
    return this.http.get<ApiResponse<ExamResult[]>>(this.API_URL, { params }).pipe(
      catchError(this.handleError)
    );
  }

  getById(id: string): Observable<ApiResponse<ExamResult>> {
    return this.http.get<ApiResponse<ExamResult>>(`${this.API_URL}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  getByClassroom(
    classroomId: string,
    examType?: ExamType,
    month?: number,
    year?: number
  ): Observable<ApiResponse<ExamResult[]>> {
    let params = new HttpParams();
    if (examType) params = params.set('examType', examType);
    if (month)    params = params.set('month', month.toString());
    if (year)     params = params.set('year', year.toString());
    return this.http.get<ApiResponse<ExamResult[]>>(`${this.API_URL}/classroom/${classroomId}`, { params }).pipe(
      catchError(this.handleError)
    );
  }

  getFilteredResults(query: FilteredResultsQuery): Observable<ApiResponse<FilteredExamResultRow[]>> {
    let params = new HttpParams().set('class', query.classValue);
    if (query.section) params = params.set('section', query.section);
    if (query.examType) params = params.set('examType', query.examType);
    if (query.month) params = params.set('month', String(query.month));
    if (query.year) params = params.set('year', String(query.year));

    return this.http.get<ApiResponse<FilteredExamResultRow[]>>(`${this.API_URL}/filter`, { params }).pipe(
      catchError(this.handleError)
    );
  }

  create(payload: Omit<ExamResult, '_id' | 'totalMarksObtained' | 'totalOutOf' | 'percentage' | 'createdAt' | 'updatedAt'>): Observable<ApiResponse<ExamResult>> {
    return this.http.post<ApiResponse<ExamResult>>(this.API_URL, payload).pipe(
      catchError(this.handleError)
    );
  }

  bulkSave(payload: BulkMarksPayload): Observable<ApiResponse<{ count: number }>> {
    return this.http.post<ApiResponse<{ count: number }>>(`${this.API_URL}/bulk`, payload).pipe(
      catchError(this.handleError)
    );
  }

  update(id: string, payload: Partial<ExamResult>): Observable<ApiResponse<ExamResult>> {
    return this.http.put<ApiResponse<ExamResult>>(`${this.API_URL}/${id}`, payload).pipe(
      catchError(this.handleError)
    );
  }

  delete(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.API_URL}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    const msg = error.error?.error || error.error?.message || error.message || 'An unexpected error occurred';
    return throwError(() => new Error(msg));
  }
}
