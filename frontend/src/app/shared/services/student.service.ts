/**
 * Student Service
 * Handles all HTTP requests related to student operations
 * Uses Angular HttpClient for API communication
 * Implements RxJS Observable patterns
 */

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { Student, ApiResponse, PaginatedResponse } from '../models/student.model';

@Injectable({
  providedIn: 'root',
})
export class StudentService {
  // Base API URL - can be configured in environment
  private readonly API_URL = 'http://localhost:4000/api/students';

  // State management with Signals (Angular 20+ feature)
  private students$ = new BehaviorSubject<Student[]>([]);
  private loading$ = new BehaviorSubject<boolean>(false);
  private error$ = new BehaviorSubject<string | null>(null);
  private selectedStudent$ = new BehaviorSubject<Student | null>(null);

  // Expose observables for components
  public studentsObservable$ = this.students$.asObservable();
  public loadingObservable$ = this.loading$.asObservable();
  public errorObservable$ = this.error$.asObservable();
  public selectedStudentObservable$ = this.selectedStudent$.asObservable();

  constructor(private http: HttpClient) {}

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
    this.loading$.next(true);
    this.error$.next(null);

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
      tap({
        next: (response) => {
          this.students$.next(response.data);
          this.loading$.next(false);
        },
        error: (error) => {
          const errorMessage = error?.error?.error || 'Failed to load students';
          this.error$.next(errorMessage);
          this.loading$.next(false);
        },
      })
    );
  }

  /**
   * Get single student by ID
   * @param id - Student document ID
   * @returns Observable of single student
   */
  getStudentById(id: string): Observable<ApiResponse<Student>> {
    this.loading$.next(true);
    this.error$.next(null);

    return this.http.get<ApiResponse<Student>>(`${this.API_URL}/${id}`).pipe(
      tap({
        next: (response) => {
          if (response.data) {
            this.selectedStudent$.next(response.data);
          }
          this.loading$.next(false);
        },
        error: (error) => {
          const errorMessage = error?.error?.error || 'Failed to load student';
          this.error$.next(errorMessage);
          this.loading$.next(false);
        },
      })
    );
  }

  /**
   * Create new student
   * @param student - Student data to create
   * @returns Observable of created student
   */
  createStudent(student: Student): Observable<ApiResponse<Student>> {
    this.loading$.next(true);
    this.error$.next(null);

    return this.http.post<ApiResponse<Student>>(this.API_URL, student).pipe(
      tap({
        next: (response) => {
          if (response.data) {
            // Add new student to list
            const currentStudents = this.students$.value;
            this.students$.next([...currentStudents, response.data]);
          }
          this.loading$.next(false);
        },
        error: (error) => {
          const errorMessage = error?.error?.error || 'Failed to create student';
          this.error$.next(errorMessage);
          this.loading$.next(false);
        },
      })
    );
  }

  /**
   * Update existing student
   * @param id - Student document ID
   * @param updates - Updated student data
   * @returns Observable of updated student
   */
  updateStudent(id: string, updates: Partial<Student>): Observable<ApiResponse<Student>> {
    this.loading$.next(true);
    this.error$.next(null);

    return this.http.put<ApiResponse<Student>>(`${this.API_URL}/${id}`, updates).pipe(
      tap({
        next: (response) => {
          if (response.data) {
            // Update student in list
            const currentStudents = this.students$.value;
            const updatedList = currentStudents.map((s) =>
              s._id === id ? response.data! : s
            );
            this.students$.next(updatedList);
            this.selectedStudent$.next(response.data);
          }
          this.loading$.next(false);
        },
        error: (error) => {
          const errorMessage = error?.error?.error || 'Failed to update student';
          this.error$.next(errorMessage);
          this.loading$.next(false);
        },
      })
    );
  }

  /**
   * Delete student
   * @param id - Student document ID
   * @returns Observable of deletion response
   */
  deleteStudent(id: string): Observable<ApiResponse<void>> {
    this.loading$.next(true);
    this.error$.next(null);

    return this.http.delete<ApiResponse<void>>(`${this.API_URL}/${id}`).pipe(
      tap({
        next: (response) => {
          // Remove student from list
          const currentStudents = this.students$.value;
          this.students$.next(currentStudents.filter((s) => s._id !== id));
          this.loading$.next(false);
        },
        error: (error) => {
          const errorMessage = error?.error?.error || 'Failed to delete student';
          this.error$.next(errorMessage);
          this.loading$.next(false);
        },
      })
    );
  }

  /**
   * Bulk import students
   * @param students - Array of students to import
   * @returns Observable of import response
   */
  bulkImportStudents(students: Student[]): Observable<ApiResponse<Student[]>> {
    this.loading$.next(true);
    this.error$.next(null);

    return this.http.post<ApiResponse<Student[]>>(`${this.API_URL}/bulk/import`, students).pipe(
      tap({
        next: (response) => {
          if (response.data) {
            const currentStudents = this.students$.value;
            this.students$.next([...currentStudents, ...response.data]);
          }
          this.loading$.next(false);
        },
        error: (error) => {
          const errorMessage = error?.error?.error || 'Failed to import students';
          this.error$.next(errorMessage);
          this.loading$.next(false);
        },
      })
    );
  }

  /**
   * Clear selected student
   */
  clearSelectedStudent(): void {
    this.selectedStudent$.next(null);
  }

  /**
   * Clear error
   */
  clearError(): void {
    this.error$.next(null);
  }

  /**
   * Get current students list
   */
  getCurrentStudents(): Student[] {
    return this.students$.value;
  }

  /**
   * Get current loading state
   */
  isLoading(): boolean {
    return this.loading$.value;
  }
}
