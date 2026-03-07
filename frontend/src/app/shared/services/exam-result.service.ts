import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ExamResult, ApiResponse } from '../models/student.model';
import { environment } from '../../../environments/environment';

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

  create(payload: Omit<ExamResult, '_id' | 'totalMarksObtained' | 'totalOutOf' | 'percentage' | 'createdAt' | 'updatedAt'>): Observable<ApiResponse<ExamResult>> {
    return this.http.post<ApiResponse<ExamResult>>(this.API_URL, payload).pipe(
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
