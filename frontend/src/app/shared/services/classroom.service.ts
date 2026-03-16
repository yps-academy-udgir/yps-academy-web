/**
 * Classroom Service
 * Handles API communication for classroom management
 */

import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap, catchError, finalize } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Classroom, ClassroomStats, FacultyAssignment, ScheduleSlot } from '../../features/classroom/models/classroom.model';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> extends ApiResponse<T> {
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

@Injectable({
  providedIn: 'root',
})
export class ClassroomService {
  private http = inject(HttpClient);
  private API_URL = `${environment.apiUrl}/classrooms`;

  // State signals
  classrooms = signal<Classroom[]>([]);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);
  selectedClassroom = signal<Classroom | null>(null);
  totalClassrooms = signal<number>(0);
  currentPage = signal<number>(1);
  pageSize = signal<number>(10);

  // Computed signals
  hasClassrooms = computed(() => this.classrooms().length > 0);
  isEmpty = computed(() => !this.loading() && this.classrooms().length === 0);
  hasError = computed(() => this.error() !== null);
  totalPages = computed(() => Math.ceil(this.totalClassrooms() / this.pageSize()));

  /**
   * Get all classrooms with pagination and filters
   */
  getAllClassrooms(
    page: number = 1,
    limit: number = 10,
    classValue?: string,
    section?: string,
    academicYear?: string,
    search?: string
  ): Observable<PaginatedResponse<Classroom[]>> {
    this.loading.set(true);
    this.error.set(null);

    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (classValue) params = params.set('class', classValue);
    if (section) params = params.set('section', section);
    if (academicYear) params = params.set('academicYear', academicYear);
    if (search) params = params.set('search', search);

    return this.http.get<PaginatedResponse<Classroom[]>>(this.API_URL, { params }).pipe(
      tap((response) => {
        this.classrooms.set(response.data);
        this.totalClassrooms.set(response.pagination.total);
        this.currentPage.set(page);
        this.pageSize.set(limit);
      }),
      catchError((error) => {
        const errorMessage = this.handleError(error);
        this.error.set(errorMessage);
        throw error;
      }),
      finalize(() => this.loading.set(false))
    );
  }

  /**
   * Get classroom by ID
   */
  getClassroomById(id: string): Observable<ApiResponse<Classroom>> {
    this.loading.set(true);
    this.error.set(null);

    return this.http.get<ApiResponse<Classroom>>(`${this.API_URL}/${id}`).pipe(
      tap((response) => {
        this.selectedClassroom.set(response.data);
      }),
      catchError((error) => {
        const errorMessage = this.handleError(error);
        this.error.set(errorMessage);
        throw error;
      }),
      finalize(() => this.loading.set(false))
    );
  }

  /**
   * Create new classroom
   */
  createClassroom(data: Partial<Classroom>): Observable<ApiResponse<Classroom>> {
    this.loading.set(true);
    this.error.set(null);

    return this.http.post<ApiResponse<Classroom>>(this.API_URL, data).pipe(
      tap((response) => {
        // Prepend to list (newest first)
        this.classrooms.update((classrooms) => [response.data, ...classrooms]);
        this.totalClassrooms.update((total) => total + 1);
      }),
      catchError((error) => {
        const errorMessage = this.handleError(error);
        this.error.set(errorMessage);
        throw error;
      }),
      finalize(() => this.loading.set(false))
    );
  }

  /**
   * Update classroom
   */
  updateClassroom(id: string, data: Partial<Classroom>): Observable<ApiResponse<Classroom>> {
    this.loading.set(true);
    this.error.set(null);

    return this.http.put<ApiResponse<Classroom>>(`${this.API_URL}/${id}`, data).pipe(
      tap((response) => {
        // Update in list
        this.classrooms.update((classrooms) =>
          classrooms.map((c) => (c._id === id ? response.data : c))
        );
        // Update selected if it matches
        if (this.selectedClassroom()?._id === id) {
          this.selectedClassroom.set(response.data);
        }
      }),
      catchError((error) => {
        const errorMessage = this.handleError(error);
        this.error.set(errorMessage);
        throw error;
      }),
      finalize(() => this.loading.set(false))
    );
  }

  /**
   * Delete classroom
   */
  deleteClassroom(id: string): Observable<ApiResponse<void>> {
    this.loading.set(true);
    this.error.set(null);

    return this.http.delete<ApiResponse<void>>(`${this.API_URL}/${id}`).pipe(
      tap(() => {
        // Remove from list
        this.classrooms.update((classrooms) => classrooms.filter((c) => c._id !== id));
        this.totalClassrooms.update((total) => total - 1);
        // Clear selected if it matches
        if (this.selectedClassroom()?._id === id) {
          this.selectedClassroom.set(null);
        }
      }),
      catchError((error) => {
        const errorMessage = this.handleError(error);
        this.error.set(errorMessage);
        throw error;
      }),
      finalize(() => this.loading.set(false))
    );
  }

  /**
   * Assign faculty to classroom
   */
  assignFaculty(
    classroomId: string,
    facultyId: string,
    subject: string,
    isPrimary: boolean = false
  ): Observable<ApiResponse<Classroom>> {
    this.loading.set(true);
    this.error.set(null);

    return this.http
      .post<ApiResponse<Classroom>>(`${this.API_URL}/${classroomId}/faculty`, {
        facultyId,
        subject,
        isPrimary,
      })
      .pipe(
        tap((response) => {
          // Update in list
          this.classrooms.update((classrooms) =>
            classrooms.map((c) => (c._id === classroomId ? response.data : c))
          );
          // Update selected if it matches
          if (this.selectedClassroom()?._id === classroomId) {
            this.selectedClassroom.set(response.data);
          }
        }),
        catchError((error) => {
          const errorMessage = this.handleError(error);
          this.error.set(errorMessage);
          throw error;
        }),
        finalize(() => this.loading.set(false))
      );
  }

  /**
   * Remove faculty from classroom
   */
  removeFaculty(
    classroomId: string,
    facultyId: string,
    subject?: string
  ): Observable<ApiResponse<Classroom>> {
    this.loading.set(true);
    this.error.set(null);

    let url = `${this.API_URL}/${classroomId}/faculty/${facultyId}`;
    if (subject) {
      url += `?subject=${subject}`;
    }

    return this.http.delete<ApiResponse<Classroom>>(url).pipe(
      tap((response) => {
        // Update in list
        this.classrooms.update((classrooms) =>
          classrooms.map((c) => (c._id === classroomId ? response.data : c))
        );
        // Update selected if it matches
        if (this.selectedClassroom()?._id === classroomId) {
          this.selectedClassroom.set(response.data);
        }
      }),
      catchError((error) => {
        const errorMessage = this.handleError(error);
        this.error.set(errorMessage);
        throw error;
      }),
      finalize(() => this.loading.set(false))
    );
  }

  /**
   * Enroll student in classroom
   */
  enrollStudent(classroomId: string, studentId: string): Observable<ApiResponse<Classroom>> {
    this.loading.set(true);
    this.error.set(null);

    return this.http
      .post<ApiResponse<Classroom>>(`${this.API_URL}/${classroomId}/students`, { studentId })
      .pipe(
        tap((response) => {
          // Update in list
          this.classrooms.update((classrooms) =>
            classrooms.map((c) => (c._id === classroomId ? response.data : c))
          );
          // Update selected if it matches
          if (this.selectedClassroom()?._id === classroomId) {
            this.selectedClassroom.set(response.data);
          }
        }),
        catchError((error) => {
          const errorMessage = this.handleError(error);
          this.error.set(errorMessage);
          throw error;
        }),
        finalize(() => this.loading.set(false))
      );
  }

  /**
   * Remove student from classroom
   */
  removeStudent(classroomId: string, studentId: string): Observable<ApiResponse<Classroom>> {
    this.loading.set(true);
    this.error.set(null);

    return this.http
      .delete<ApiResponse<Classroom>>(`${this.API_URL}/${classroomId}/students/${studentId}`)
      .pipe(
        tap((response) => {
          // Update in list
          this.classrooms.update((classrooms) =>
            classrooms.map((c) => (c._id === classroomId ? response.data : c))
          );
          // Update selected if it matches
          if (this.selectedClassroom()?._id === classroomId) {
            this.selectedClassroom.set(response.data);
          }
        }),
        catchError((error) => {
          const errorMessage = this.handleError(error);
          this.error.set(errorMessage);
          throw error;
        }),
        finalize(() => this.loading.set(false))
      );
  }

  /**
   * Update classroom schedule
   */
  updateSchedule(classroomId: string, schedule: ScheduleSlot[]): Observable<ApiResponse<Classroom>> {
    this.loading.set(true);
    this.error.set(null);

    return this.http
      .put<ApiResponse<Classroom>>(`${this.API_URL}/${classroomId}/schedule`, { schedule })
      .pipe(
        tap((response) => {
          // Update in list
          this.classrooms.update((classrooms) =>
            classrooms.map((c) => (c._id === classroomId ? response.data : c))
          );
          // Update selected if it matches
          if (this.selectedClassroom()?._id === classroomId) {
            this.selectedClassroom.set(response.data);
          }
        }),
        catchError((error) => {
          const errorMessage = this.handleError(error);
          this.error.set(errorMessage);
          throw error;
        }),
        finalize(() => this.loading.set(false))
      );
  }

  /**
   * Get classroom schedule
   */
  getSchedule(classroomId: string): Observable<ApiResponse<any>> {
    this.loading.set(true);
    this.error.set(null);

    return this.http.get<ApiResponse<any>>(`${this.API_URL}/${classroomId}/schedule`).pipe(
      catchError((error) => {
        const errorMessage = this.handleError(error);
        this.error.set(errorMessage);
        throw error;
      }),
      finalize(() => this.loading.set(false))
    );
  }

  /**
   * Get classroom statistics
   */
  getClassroomStats(): Observable<ApiResponse<ClassroomStats>> {
    return this.http.get<ApiResponse<ClassroomStats>>(`${this.API_URL}/stats/overview`);
  }

  /**
   * Handle HTTP errors
   */
  private handleError(error: any): string {
    if (error.error?.message) {
      return error.error.message;
    }

    switch (error.status) {
      case 400:
        return 'Invalid data provided';
      case 404:
        return 'Classroom not found';
      case 409:
        return error.error?.message || 'Classroom already exists';
      case 500:
        return 'Server error. Please try again later';
      default:
        return 'An unexpected error occurred';
    }
  }

  /**
   * Clear error
   */
  clearError(): void {
    this.error.set(null);
  }

  /**
   * Clear selected classroom
   */
  clearSelection(): void {
    this.selectedClassroom.set(null);
  }
}
