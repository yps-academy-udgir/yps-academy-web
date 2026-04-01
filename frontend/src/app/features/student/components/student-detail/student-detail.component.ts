/**
 * Student Detail Component
 * Displays detailed information about a single student
 * Uses Angular Material cards and follows Angular 20 patterns
 */
import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';

import { SharedMaterialModule } from '../../../../shared/shared-material.module';
import { StudentService } from '../../../../shared/services/student.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { LoadingComponent } from '../../../../shared/components/loading/loading.component';
import { ErrorMessageComponent } from '../../../../shared/components/error-message/error-message.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { CredentialsDialogComponent } from '../../../../shared/components/credentials-dialog/credentials-dialog.component';
import { Student, ExamResult } from '../../../../shared/models/student.model';
import { ExamResultService } from '../../../../shared/services/exam-result.service';
import { AuthService } from '../../../auth/services/auth.service';
import { RoleService } from '../../../../shared/services/role.service';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

@Component({
  selector: 'app-student-detail',
  standalone: true,
  imports: [
    CommonModule,
    SharedMaterialModule,
    LoadingComponent,
    ErrorMessageComponent,
  ],
  templateUrl: './student-detail.component.html',
  styleUrls: ['./student-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StudentDetailComponent implements OnInit {
  // Inject services
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private studentService = inject(StudentService);
  private examResultService = inject(ExamResultService);
  private notificationService = inject(NotificationService);
  private authService = inject(AuthService);
  private dialog = inject(MatDialog);
  roleService = inject(RoleService);

  // Signals
  student = signal<Student | null>(null);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);
  examResults = signal<ExamResult[]>([]);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadStudent(id);
    } else {
      this.router.navigate(['/students', 'management', 'list']);
    }
  }

  /**
   * Load student data
   */
  private loadStudent(id: string): void {
    this.loading.set(true);
    this.error.set(null);

    this.studentService.getStudentById(id).subscribe({
      next: (response) => {
        if (response.data) {
          this.student.set(response.data);
          this.loadExamResults(id);
        }
        this.loading.set(false);
      },
      error: (error) => {
        this.error.set('Failed to load student details');
        this.loading.set(false);
      },
    });
  }

  /**
   * Navigate to edit page
   */
  onEdit(): void {
    const student = this.student();
    if (student?._id) {
      this.router.navigate(['/students', 'management', student._id, 'edit']);
    }
  }

  onEnterMarks(): void {
    const student = this.student();
    if (student?._id) {
      this.router.navigate(['/students', student._id, 'marks']);
    }
  }

  onViewFeeReceipt(): void {
    const student = this.student();
    if (student?._id) {
      this.router.navigate(['/students', 'fees', student._id, 'receipt']);
    }
  }

  onGenerateLatestMarksReport(): void {
    const student = this.student();
    const latestResult = this.getLatestExamResult();

    if (!student?._id || !latestResult?._id) {
      this.notificationService.warning('No exam result is available to generate a marks report.');
      return;
    }

    this.router.navigate(['/students', 'reports', student._id, latestResult._id]);
  }

  onGenerateMarksReport(result: ExamResult): void {
    const student = this.student();
    if (student?._id && result._id) {
      this.router.navigate(['/students', 'reports', student._id, result._id]);
    }
  }

  private getLatestExamResult(): ExamResult | null {
    const results = [...this.examResults()];
    if (results.length === 0) {
      return null;
    }

    results.sort((left, right) => {
      if (left.year !== right.year) {
        return right.year - left.year;
      }
      if (left.month !== right.month) {
        return right.month - left.month;
      }

      const leftTime = left.updatedAt ? new Date(left.updatedAt).getTime() : 0;
      const rightTime = right.updatedAt ? new Date(right.updatedAt).getTime() : 0;
      return rightTime - leftTime;
    });

    return results[0] ?? null;
  }

  private loadExamResults(studentId: string): void {
    this.examResultService.getByStudent(studentId).subscribe({
      next: (res) => this.examResults.set((res.data as unknown as ExamResult[]) ?? []),
      error: () => { /* non-critical */ },
    });
  }

  getMonthName(month: number): string {
    return MONTH_NAMES[month - 1] ?? '';
  }

  /**
   * Delete student with confirmation
   */
  onDelete(): void {
    const student = this.student();
    if (!student?._id) return;

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete Student',
        message: `Are you sure you want to delete ${student.firstName} ${student.lastName}? This action cannot be undone.`,
        confirmText: 'Delete',
        cancelText: 'Cancel',
        confirmColor: 'warn',
      },
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed && student._id) {
        this.deleteStudent(student._id);
      }
    });
  }

  /**
   * Delete student
   */
  private deleteStudent(id: string): void {
    this.studentService.deleteStudent(id).subscribe({
      next: () => {
        this.notificationService.success('Student deleted successfully');
        this.router.navigate(['/students', 'management', 'list']);
      },
      error: () => {
        this.notificationService.error('Failed to delete student');
      },
    });
  }

  onResetPassword(): void {
    const s = this.student();
    if (!s?.userId) {
      this.notificationService.error('No login account found for this student.');
      return;
    }
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Reset Password',
        message: `Reset the password for ${s.firstName} ${s.lastName}? They will be prompted to change it on next login.`,
        confirmText: 'Reset',
        cancelText: 'Cancel',
      },
    });
    ref.afterClosed().subscribe((confirmed) => {
      if (!confirmed) return;
      this.authService.resetPassword(s.userId!, 'student').subscribe({
        next: (result) => {
          this.dialog.open(CredentialsDialogComponent, {
            data: { name: `${s.firstName} ${s.lastName}`, userId: result.userId, defaultPassword: result.defaultPassword, role: 'student' },
            disableClose: true,
          });
        },
        error: () => this.notificationService.error('Failed to reset password.'),
      });
    });
  }

  /**
   * Navigate back to list
   */
  onBack(): void {
    this.router.navigate(['/students', 'management', 'list']);
  }

  /**
   * Retry loading
   */
  onRetry(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadStudent(id);
    }
  }
}
