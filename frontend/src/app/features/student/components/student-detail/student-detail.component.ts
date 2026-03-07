/**
 * Student Detail Component
 * Displays detailed information about a single student
 * Uses Angular Material cards and follows Angular 20 patterns
 */
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';

import { SharedMaterialModule } from '../../../../shared/shared-material.module';
import { StudentService } from '../../../../shared/services/student.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { LoadingComponent } from '../../../../shared/components/loading/loading.component';
import { ErrorMessageComponent } from '../../../../shared/components/error-message/error-message.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { Student, ExamResult } from '../../../../shared/models/student.model';
import { ExamResultService } from '../../../../shared/services/exam-result.service';

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
})
export class StudentDetailComponent implements OnInit {
  // Inject services
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private studentService = inject(StudentService);
  private examResultService = inject(ExamResultService);
  private notificationService = inject(NotificationService);
  private dialog = inject(MatDialog);

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
      this.router.navigate(['/students']);
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
      this.router.navigate(['/students', student._id, 'edit']);
    }
  }

  onEnterMarks(): void {
    const student = this.student();
    if (student?._id) {
      this.router.navigate(['/students', student._id, 'marks']);
    }
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
        this.router.navigate(['/students']);
      },
      error: () => {
        this.notificationService.error('Failed to delete student');
      },
    });
  }

  /**
   * Navigate back to list
   */
  onBack(): void {
    this.router.navigate(['/students']);
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
