import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators, AbstractControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';

import { SharedMaterialModule } from '../../../../shared/shared-material.module';
import { StudentService } from '../../../../shared/services/student.service';
import { ExamResultService } from '../../../../shared/services/exam-result.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { LoadingComponent } from '../../../../shared/components/loading/loading.component';
import { ErrorMessageComponent } from '../../../../shared/components/error-message/error-message.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { Student, ExamType, ExamResult } from '../../../../shared/models/student.model';

export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

@Component({
  selector: 'app-marks-entry',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, SharedMaterialModule, LoadingComponent, ErrorMessageComponent],
  templateUrl: './marks-entry.component.html',
  styleUrls: ['./marks-entry.component.scss'],
})
export class MarksEntryComponent implements OnInit {
  private route    = inject(ActivatedRoute);
  private router   = inject(Router);
  private fb       = inject(FormBuilder);
  private studentService    = inject(StudentService);
  private examResultService = inject(ExamResultService);
  private notificationService = inject(NotificationService);
  private dialog   = inject(MatDialog);

  // State
  student       = signal<Student | null>(null);
  loading       = signal(false);
  saving        = signal(false);
  error         = signal<string | null>(null);
  pastResults   = signal<ExamResult[]>([]);
  editingId     = signal<string | null>(null);   // non-null when editing an existing result

  // Statics
  examTypes  = Object.values(ExamType);
  monthNames = MONTH_NAMES;
  currentYear = new Date().getFullYear();
  yearOptions = Array.from({ length: 10 }, (_, i) => this.currentYear - 2 + i); // -2 to +7

  // Form
  form!: FormGroup;

  // Computed totals from live form values
  totalObtained = signal(0);
  totalOutOf    = signal(0);
  percentage    = computed(() =>
    this.totalOutOf() > 0 ? +((this.totalObtained() / this.totalOutOf()) * 100).toFixed(1) : 0
  );

  get subjectMarksArray(): FormArray {
    return this.form.get('subjectMarks') as FormArray;
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) { this.router.navigate(['/students']); return; }

    this.form = this.fb.group({
      examType: ['', Validators.required],
      month:    [new Date().getMonth() + 1, Validators.required],
      year:     [this.currentYear, [Validators.required, Validators.min(2000)]],
      subjectMarks: this.fb.array([]),
    });

    this.loadStudent(id);
  }

  private loadStudent(id: string): void {
    this.loading.set(true);
    this.studentService.getStudentById(id).subscribe({
      next: (res) => {
        if (res.data) {
          this.student.set(res.data);
          this.buildSubjectRows(res.data.academicDetails?.subjects ?? []);
          this.loadPastResults(id);
        }
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load student details');
        this.loading.set(false);
      },
    });
  }

  private buildSubjectRows(subjects: string[]): void {
    const fa = this.subjectMarksArray;
    fa.clear();
    subjects.forEach(subject => {
      const grp = this.fb.group({
        subject:       [subject],
        outOf:         [100, [Validators.required, Validators.min(1), Validators.max(1000)]],
        marksObtained: [null, [Validators.required, Validators.min(0)]],
      });
      // Add cross-field validator: marksObtained <= outOf
      grp.setValidators(this.marksNotExceedOutOf);
      fa.push(grp);
    });
    this.recalcTotals();
  }

  private marksNotExceedOutOf(group: AbstractControl) {
    const outOf = group.get('outOf')?.value;
    const obtained = group.get('marksObtained')?.value;
    if (obtained !== null && obtained > outOf) {
      return { marksExceedOutOf: true };
    }
    return null;
  }

  recalcTotals(): void {
    const rows = this.subjectMarksArray.value as { outOf: number; marksObtained: number }[];
    this.totalOutOf.set(rows.reduce((s, r) => s + (r.outOf || 0), 0));
    this.totalObtained.set(rows.reduce((s, r) => s + (r.marksObtained || 0), 0));
  }

  private loadPastResults(studentId: string): void {
    this.examResultService.getByStudent(studentId).subscribe({
      next: (res) => this.pastResults.set((res.data as unknown as ExamResult[]) ?? []),
      error: () => { /* non-critical — past results just won't show */ },
    });
  }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const s = this.student();
    if (!s?._id) return;

    this.saving.set(true);
    const payload = { studentId: s._id, ...this.form.value };

    const op = this.editingId()
      ? this.examResultService.update(this.editingId()!, payload)
      : this.examResultService.create(payload);

    op.subscribe({
      next: (res) => {
        this.saving.set(false);
        this.notificationService.success(this.editingId() ? 'Marks updated successfully' : 'Marks saved successfully');
        this.editingId.set(null);
        this.resetForm();
        this.loadPastResults(s._id!);
      },
      error: (err: Error) => {
        this.saving.set(false);
        this.notificationService.error(err.message || 'Failed to save marks');
      },
    });
  }

  onEditResult(result: ExamResult): void {
    this.editingId.set(result._id!);
    this.form.patchValue({
      examType: result.examType,
      month:    result.month,
      year:     result.year,
    });
    const fa = this.subjectMarksArray;
    fa.clear();
    result.subjectMarks.forEach(sm => {
      const grp = this.fb.group({
        subject:       [sm.subject],
        outOf:         [sm.outOf, [Validators.required, Validators.min(1), Validators.max(1000)]],
        marksObtained: [sm.marksObtained, [Validators.required, Validators.min(0)]],
      });
      grp.setValidators(this.marksNotExceedOutOf);
      fa.push(grp);
    });
    this.recalcTotals();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  onDeleteResult(result: ExamResult): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete Exam Result',
        message: `Delete marks for ${result.examType} – ${MONTH_NAMES[result.month - 1]} ${result.year}?`,
        confirmText: 'Delete',
        cancelText: 'Cancel',
        confirmColor: 'warn',
      },
    });
    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed && result._id) {
        this.examResultService.delete(result._id).subscribe({
          next: () => {
            this.notificationService.success('Exam result deleted');
            this.pastResults.update(list => list.filter(r => r._id !== result._id));
          },
          error: () => this.notificationService.error('Failed to delete exam result'),
        });
      }
    });
  }

  cancelEdit(): void {
    this.editingId.set(null);
    this.resetForm();
  }

  private resetForm(): void {
    this.form.patchValue({
      examType: '',
      month: new Date().getMonth() + 1,
      year: this.currentYear,
    });
    const s = this.student();
    this.buildSubjectRows(s?.academicDetails?.subjects ?? []);
    this.form.markAsPristine();
    this.form.markAsUntouched();
  }

  onBack(): void {
    const s = this.student();
    if (s?._id) this.router.navigate(['/students', s._id]);
    else this.router.navigate(['/students']);
  }

  getMonthName(month: number): string { return MONTH_NAMES[month - 1] ?? ''; }

  hasSubjects(): boolean {
    return (this.student()?.academicDetails?.subjects?.length ?? 0) > 0;
  }

  onRetry(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.loadStudent(id);
  }
}
