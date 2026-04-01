import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SharedMaterialModule } from '../../../../shared/shared-material.module';
import { StudentService } from '../../../../shared/services/student.service';
import { ExamResultService } from '../../../../shared/services/exam-result.service';
import { LoadingComponent } from '../../../../shared/components/loading/loading.component';
import { ErrorMessageComponent } from '../../../../shared/components/error-message/error-message.component';
import { Student, ExamResult } from '../../../../shared/models/student.model';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

@Component({
  selector: 'app-my-profile',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, SharedMaterialModule, LoadingComponent, ErrorMessageComponent],
  templateUrl: './my-profile.component.html',
  styleUrls: ['./my-profile.component.scss'],
})
export class MyProfileComponent implements OnInit {
  private studentService = inject(StudentService);
  private examResultService = inject(ExamResultService);
  private router = inject(Router);

  student = signal<Student | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);
  examResults = signal<ExamResult[]>([]);

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.studentService.getMe().subscribe({
      next: (res) => {
        if (res.data) {
          this.student.set(res.data);
          if (res.data._id) {
            this.examResultService.getByStudent(res.data._id).subscribe({
              next: (r) => this.examResults.set((r.data as unknown as ExamResult[]) ?? []),
              error: () => { /* non-critical */ },
            });
          }
        }
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load your profile. Please try again.');
        this.loading.set(false);
      },
    });
  }

  onViewFeeReceipt(): void {
    this.router.navigate(['/my-fees']);
  }

  onGenerateMarksReport(result: ExamResult): void {
    this.router.navigate(['/my-marks']);
  }

  getMonthName(month: number): string {
    return MONTH_NAMES[month - 1] ?? '';
  }
}
