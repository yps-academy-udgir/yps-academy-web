import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { SubjectConfig, SubjectEntry } from '../models/subject-config.model';
import { ApiResponse } from '../models/student.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SubjectConfigService {
  private http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/subject-config`;

  subjectConfig = signal<SubjectConfig | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);

  get(): Observable<ApiResponse<SubjectConfig>> {
    this.loading.set(true);
    return this.http.get<ApiResponse<SubjectConfig>>(this.API_URL).pipe(
      tap((res) => {
        if (res.data) this.subjectConfig.set(res.data);
      }),
      catchError((err) => {
        this.error.set(err?.error?.message ?? 'Failed to load subject config');
        return throwError(() => err);
      }),
      tap({ finalize: () => this.loading.set(false) } as any)
    );
  }

  update(config: Pick<SubjectConfig, 'classSubjects' | 'selfStudyFee'>): Observable<ApiResponse<SubjectConfig>> {
    this.loading.set(true);
    return this.http.put<ApiResponse<SubjectConfig>>(this.API_URL, config).pipe(
      tap((res) => {
        if (res.data) this.subjectConfig.set(res.data);
      }),
      catchError((err) => {
        this.error.set(err?.error?.message ?? 'Failed to update subject config');
        return throwError(() => err);
      }),
      tap({ finalize: () => this.loading.set(false) } as any)
    );
  }

  /** Active subjects for a specific class */
  getSubjectsForClass(className: string): SubjectEntry[] {
    const cfg = this.subjectConfig();
    if (!cfg || !cfg.classSubjects) return [];
    const entry = cfg.classSubjects.find((c) => c.className === className);
    return entry?.subjects.filter((s) => s.isActive) ?? [];
  }

  /** Fee map for a specific class: { subjectName → fee } */
  getFeeMapForClass(className: string): Record<string, number> {
    return Object.fromEntries(
      this.getSubjectsForClass(className).map((s) => [s.name, s.fee])
    );
  }
}
