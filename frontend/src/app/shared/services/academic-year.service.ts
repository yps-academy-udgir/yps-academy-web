import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface PromotionPreview {
  newAcademicYear: string;
  toPromote: number;
  toGraduate: number;
  blocked: { class: string; reason: string }[];
  canProceed: boolean;
}

export interface PromotionResult {
  promoted: number;
  graduated: number;
  newAcademicYear: string;
}

@Injectable({ providedIn: 'root' })
export class AcademicYearService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/academic-year`;

  getPromotionPreview(newAcademicYear: string): Observable<{ data: PromotionPreview }> {
    return this.http.get<{ data: PromotionPreview }>(
      `${this.baseUrl}/promotion-preview?newAcademicYear=${encodeURIComponent(newAcademicYear)}`
    );
  }

  promote(newAcademicYear: string): Observable<{ data: PromotionResult }> {
    return this.http.post<{ data: PromotionResult }>(`${this.baseUrl}/promote`, { newAcademicYear });
  }
}
