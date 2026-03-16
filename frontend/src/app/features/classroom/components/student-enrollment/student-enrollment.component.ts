import { Component, ChangeDetectionStrategy, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { ClassroomService } from '../../../../shared/services/classroom.service';
import { StudentService } from '../../../../shared/services/student.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { Student } from '../../../../shared/models/student.model';

@Component({
  selector: 'app-student-enrollment',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatChipsModule,
  ],
  templateUrl: './student-enrollment.component.html',
  styleUrls: ['./student-enrollment.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StudentEnrollmentComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private classroomService = inject(ClassroomService);
  private studentService = inject(StudentService);
  private notification = inject(NotificationService);

  classroomId = signal<string>('');
  loading = signal<boolean>(false);
  saving = signal<boolean>(false);
  selectedStudentIds = signal<string[]>([]);

  students = this.studentService.students;
  classroom = this.classroomService.selectedClassroom;

  enrolledIds = computed(() => {
    const current = this.classroom();
    if (!current) return [] as string[];

    return current.enrolledStudents.map((s) =>
      typeof s === 'string' ? s : s._id
    );
  });

  availableStudents = computed(() => {
    const enrolled = new Set(this.enrolledIds());
    return this.students().filter((s) => s._id && !enrolled.has(s._id));
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.notification.error('Classroom ID is missing');
      this.router.navigate(['/classrooms/management/list']);
      return;
    }

    this.classroomId.set(id);
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);

    this.classroomService.getClassroomById(this.classroomId()).subscribe({
      next: () => {
        this.studentService.getAllStudents(1, 1000).subscribe({
          next: () => {
            this.loading.set(false);
          },
          error: () => {
            this.loading.set(false);
            this.notification.error('Failed to load student list');
          },
        });
      },
      error: () => {
        this.loading.set(false);
        this.notification.error('Failed to load classroom details');
      },
    });
  }

  toggleStudent(studentId: string, checked: boolean): void {
    const selected = new Set(this.selectedStudentIds());
    if (checked) {
      selected.add(studentId);
    } else {
      selected.delete(studentId);
    }
    this.selectedStudentIds.set(Array.from(selected));
  }

  isSelected(studentId: string): boolean {
    return this.selectedStudentIds().includes(studentId);
  }

  enrollSelected(): void {
    const ids = this.selectedStudentIds();
    if (ids.length === 0) {
      this.notification.warning('Select at least one student');
      return;
    }

    this.saving.set(true);
    this.classroomService.enrollStudentsBulk(this.classroomId(), ids).subscribe({
      next: (result) => {
        this.saving.set(false);
        this.selectedStudentIds.set([]);
        this.classroomService.getClassroomById(this.classroomId()).subscribe();

        if (result.failedCount > 0) {
          this.notification.warning(
            `Enrolled ${result.successCount} student(s). Failed: ${result.failedCount}.`
          );
          return;
        }

        this.notification.success(`Enrolled ${result.successCount} student(s) successfully`);
      },
      error: () => {
        this.saving.set(false);
        this.notification.error('Failed to enroll students');
      },
    });
  }

  backToClassroom(): void {
    this.router.navigate(['/classrooms/management', this.classroomId()]);
  }

  feeStatus(student: Student): string {
    const pending = student.feeDetails?.pendingFees ?? 0;
    return pending > 0 ? `Pending: Rs ${pending}` : 'Fees clear';
  }
}
