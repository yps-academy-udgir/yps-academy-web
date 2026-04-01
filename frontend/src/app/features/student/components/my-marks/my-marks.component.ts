import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { StudentService } from '../../../../shared/services/student.service';
import { ExamResultService } from '../../../../shared/services/exam-result.service';
import { LoadingComponent } from '../../../../shared/components/loading/loading.component';
import { ErrorMessageComponent } from '../../../../shared/components/error-message/error-message.component';
import { ExamResult } from '../../../../shared/models/student.model';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

@Component({
  selector: 'app-my-marks',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatCardModule, MatChipsModule, LoadingComponent, ErrorMessageComponent],
  templateUrl: './my-marks.component.html',
  styleUrls: ['./my-marks.component.scss'],
})
export class MyMarksComponent implements OnInit {
  private studentService = inject(StudentService);
  private examResultService = inject(ExamResultService);
  private router = inject(Router);

  studentId = signal<string | null>(null);
  examResults = signal<ExamResult[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.studentService.getMe().subscribe({
      next: (res) => {
        const id = res.data?._id;
        if (!id) { this.error.set('Profile not found.'); this.loading.set(false); return; }
        this.studentId.set(id);
        this.examResultService.getByStudent(id).subscribe({
          next: (r) => {
            this.examResults.set((r.data as unknown as ExamResult[]) ?? []);
            this.loading.set(false);
          },
          error: () => { this.error.set('Failed to load marks.'); this.loading.set(false); },
        });
      },
      error: () => { this.error.set('Failed to load profile.'); this.loading.set(false); },
    });
  }

  onViewReport(result: ExamResult): void {
    const id = this.studentId();
    if (id && result._id) this.router.navigate(['/students', 'reports', id, result._id]);
  }

  onBack(): void {
    this.router.navigate(['/my-profile']);
  }

  getMonthName(month: number): string {
    return MONTH_NAMES[month - 1] ?? '';
  }

  pctClass(pct: number): string {
    if (pct >= 75) return 'pct-high';
    if (pct >= 40) return 'pct-mid';
    return 'pct-low';
  }
}
