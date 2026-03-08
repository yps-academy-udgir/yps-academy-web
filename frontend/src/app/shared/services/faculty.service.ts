import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { tap, catchError, finalize } from 'rxjs/operators';
import { Faculty } from '../../features/faculty/models/faculty.model';
import { ApiResponse, PaginatedResponse } from '../models/student.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class FacultyService {
  private http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/faculty`;

  faculty = signal<Faculty[]>([]);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);
  selectedFaculty = signal<Faculty | null>(null);
  totalFaculty = signal<number>(0);
  currentPage = signal<number>(1);
  pageSize = signal<number>(10);

  hasFaculty = computed(() => this.faculty().length > 0);
  isEmpty = computed(() => !this.loading() && this.faculty().length === 0);
  hasError = computed(() => this.error() !== null);
  totalPages = computed(() => Math.ceil(this.totalFaculty() / this.pageSize()));

  getAllFaculty(page = 1, limit = 10, department?: string): Observable<PaginatedResponse<Faculty>> {
    this.loading.set(true);
    this.error.set(null);
    let params = new HttpParams().set('page', page.toString()).set('limit', limit.toString());
    if (department) params = params.set('department', department);
    return this.http.get<PaginatedResponse<Faculty>>(this.API_URL, { params }).pipe(
      tap((res) => {
        this.faculty.set(res.data);
        this.totalFaculty.set(res.pagination.total);
        this.currentPage.set(page);
        this.pageSize.set(limit);
      }),
      catchError((err) => this.handleError(err)),
      finalize(() => this.loading.set(false))
    );
  }

  getFacultyById(id: string): Observable<ApiResponse<Faculty>> {
    this.loading.set(true);
    this.error.set(null);
    return this.http.get<ApiResponse<Faculty>>(`${this.API_URL}/${id}`).pipe(
      tap((res) => { if (res.data) this.selectedFaculty.set(res.data); }),
      catchError((err) => this.handleError(err)),
      finalize(() => this.loading.set(false))
    );
  }

  createFaculty(faculty: Partial<Faculty>): Observable<ApiResponse<Faculty>> {
    this.loading.set(true);
    this.error.set(null);
    return this.http.post<ApiResponse<Faculty>>(this.API_URL, faculty).pipe(
      tap((res) => {
        if (res.data) {
          this.faculty.update((list) => [res.data!, ...list]);
          this.totalFaculty.update((total) => total + 1);
        }
      }),
      catchError((err) => this.handleError(err)),
      finalize(() => this.loading.set(false))
    );
  }

  updateFaculty(id: string, data: Partial<Faculty>): Observable<ApiResponse<Faculty>> {
    this.loading.set(true);
    this.error.set(null);
    return this.http.put<ApiResponse<Faculty>>(`${this.API_URL}/${id}`, data).pipe(
      tap((res) => {
        if (res.data) {
          this.faculty.update((list) => list.map((f) => (f._id === id ? res.data! : f)));
          this.selectedFaculty.set(res.data);
        }
      }),
      catchError((err) => this.handleError(err)),
      finalize(() => this.loading.set(false))
    );
  }

  deleteFaculty(id: string): Observable<ApiResponse<void>> {
    this.loading.set(true);
    this.error.set(null);
    return this.http.delete<ApiResponse<void>>(`${this.API_URL}/${id}`).pipe(
      tap(() => {
        this.faculty.update((list) => list.filter((f) => f._id !== id));
        this.totalFaculty.update((total) => total - 1);
        if (this.selectedFaculty()?._id === id) this.selectedFaculty.set(null);
      }),
      catchError((err) => this.handleError(err)),
      finalize(() => this.loading.set(false))
    );
  }

  clearSelectedFaculty(): void {
    this.selectedFaculty.set(null);
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let msg = 'An unexpected error occurred';
    if (error.error instanceof ErrorEvent) {
      msg = `Error: ${error.error.message}`;
    } else {
      switch (error.status) {
        case 400: msg = error.error?.message || 'Invalid request data'; break;
        case 404: msg = 'Faculty member not found'; break;
        case 409: msg = 'A faculty member with this email already exists'; break;
        case 500: msg = 'Server error. Please try again later'; break;
        default: msg = error.error?.message || msg;
      }
    }
    this.error.set(msg);
    return throwError(() => new Error(msg));
  }
}
