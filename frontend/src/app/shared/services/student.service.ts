/**
 * Student Service
 * Handles all HTTP requests related to student operations
 * Uses Angular HttpClient for API communication
 * Implements Angular 20 Signals for reactive state management
 * Follows industry best practices with proper error handling
 */

import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { tap, catchError, finalize } from 'rxjs/operators';
import { Student, ApiResponse, PaginatedResponse } from '../models/student.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class StudentService {
  private http = inject(HttpClient);

  // Base API URL from environment
  private readonly API_URL = `${environment.apiUrl}/students`;

  // Angular 20 Signals for reactive state management
  students = signal<Student[]>([]);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);
  selectedStudent = signal<Student | null>(null);
  totalStudents = signal<number>(0);
  currentPage = signal<number>(1);
  pageSize = signal<number>(10);

  // Computed signals
  hasStudents = computed(() => this.students().length > 0);
  isEmpty = computed(() => !this.loading() && this.students().length === 0);
  hasError = computed(() => this.error() !== null);
  totalPages = computed(() => Math.ceil(this.totalStudents() / this.pageSize()));

  /**
   * Get all students with optional filtering and pagination
   * @param page - Page number (1-indexed)
   * @param limit - Records per page
   * @param department - Filter by department
   * @param status - Filter by status
   * @returns Observable of paginated student list
   */
  getAllStudents(
    page: number = 1,
    limit: number = 10,
    department?: string,
    status?: string
  ): Observable<PaginatedResponse<Student>> {
    this.loading.set(true);
    this.error.set(null);

    // Build query parameters dynamically
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (department) {
      params = params.set('department', department);
    }
    if (status) {
      params = params.set('status', status);
    }

    return this.http.get<PaginatedResponse<Student>>(this.API_URL, { params }).pipe(
      tap((response) => {
        this.students.set(response.data);
        this.totalStudents.set(response.pagination.total);
        this.currentPage.set(page);
        this.pageSize.set(limit);
      }),
      catchError((error) => this.handleError(error)),
      finalize(() => this.loading.set(false))
    );
  }

  /**
   * Get single student by ID
   * @param id - Student document ID
   * @returns Observable of single student
   */
  getStudentById(id: string): Observable<ApiResponse<Student>> {
    this.loading.set(true);
    this.error.set(null);

    return this.http.get<ApiResponse<Student>>(`${this.API_URL}/${id}`).pipe(
      tap((response) => {
        if (response.data) {
          this.selectedStudent.set(response.data);
        }
      }),
      catchError((error) => this.handleError(error)),
      finalize(() => this.loading.set(false))
    );
  }

  /**
   * Create new student
   * @param student - Student data
   * @returns Observable of created student
   */
  createStudent(student: Partial<Student>): Observable<ApiResponse<Student>> {
    this.loading.set(true);
    this.error.set(null);

    return this.http.post<ApiResponse<Student>>(this.API_URL, student).pipe(
      tap((response) => {
        if (response.data) {
          // Add new student to the list
          this.students.update(students => [response.data!, ...students]);
          this.totalStudents.update(total => total + 1);
        }
      }),
      catchError((error) => this.handleError(error)),
      finalize(() => this.loading.set(false))
    );
  }

  /**
   * Update existing student
   * @param id - Student document ID
   * @param student - Updated student data
   * @returns Observable of updated student
   */
  updateStudent(id: string, student: Partial<Student>): Observable<ApiResponse<Student>> {
    this.loading.set(true);
    this.error.set(null);

    return this.http.put<ApiResponse<Student>>(`${this.API_URL}/${id}`, student).pipe(
      tap((response) => {
        if (response.data) {
          // Update student in the list
          this.students.update(students =>
            students.map(s => s._id === id ? response.data! : s)
          );
          this.selectedStudent.set(response.data);
        }
      }),
      catchError((error) => this.handleError(error)),
      finalize(() => this.loading.set(false))
    );
  }

  /**
   * Delete student by ID
   * @param id - Student document ID
   * @returns Observable of deletion result
   */
  deleteStudent(id: string): Observable<ApiResponse<void>> {
    this.loading.set(true);
    this.error.set(null);

    return this.http.delete<ApiResponse<void>>(`${this.API_URL}/${id}`).pipe(
      tap(() => {
        // Remove student from the list
        this.students.update(students => students.filter(s => s._id !== id));
        this.totalStudents.update(total => total - 1);
        if (this.selectedStudent()?._id === id) {
          this.selectedStudent.set(null);
        }
      }),
      catchError((error) => this.handleError(error)),
      finalize(() => this.loading.set(false))
    );
  }

  /**
   * Clear selected student
   */
  clearSelectedStudent(): void {
    this.selectedStudent.set(null);
  }

  /**
   * Handle HTTP errors
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unexpected error occurred';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = error.error?.error || error.error?.message || error.message;
    }

    this.error.set(errorMessage);
    
    if (environment.enableLogging) {
      console.error('StudentService Error:', error);
    }

    return throwError(() => new Error(errorMessage));
  }
}

