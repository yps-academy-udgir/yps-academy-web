import { Component, inject, OnInit, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { ClassroomService } from '../../../../shared/services/classroom.service';
import { AttendanceService, BulkAttendanceInput } from '../../../../shared/services/attendance.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { StudentInfo } from '../../models/classroom.model';

@Component({
  selector: 'app-mark-attendance',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatSelectModule, MatInputModule, MatButtonToggleModule, MatProgressSpinnerModule, MatDividerModule],
  templateUrl: './mark-attendance.component.html',
  styleUrls: ['./mark-attendance.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MarkAttendanceComponent implements OnInit {
  private classroomService = inject(ClassroomService);
  private attendanceService = inject(AttendanceService);
  private notification = inject(NotificationService);
  private router = inject(Router);

  classrooms = this.classroomService.classrooms;
  loadingClassrooms = this.classroomService.loading;

  selectedClassroomId = signal('');
  selectedDate = signal(new Date().toISOString().slice(0, 10));
  selectedSubject = signal('');
  saving = signal(false);

  selectedClassroom = computed(() =>
    this.classrooms().find(c => c._id === this.selectedClassroomId()) ?? null
  );

  subjectOptions = computed((): string[] => {
    const c = this.selectedClassroom();
    if (!c) return [];
    return [...new Set(c.facultyAssignments.map(fa => fa.subject as string))];
  });

  enrolledStudents = computed(() => this.selectedClassroom()?.enrolledStudents ?? []);

  attendanceMap = signal<Record<string, 'present' | 'absent' | 'late'>>({});

  isReady = computed(() =>
    !!this.selectedClassroomId() && !!this.selectedDate() && !!this.selectedSubject() && this.enrolledStudents().length > 0
  );

  ngOnInit(): void {
    this.classroomService.getAllClassrooms(1, 100).subscribe();
  }

  onClassroomChange(id: string): void {
    this.selectedClassroomId.set(id);
    this.selectedSubject.set('');
    const c = this.classrooms().find(x => x._id === id);
    const map: Record<string, 'present' | 'absent' | 'late'> = {};
    if (c) {
      for (const s of c.enrolledStudents) {
        const sid = this.getStudentId(s);
        map[sid] = 'present';
      }
    }
    this.attendanceMap.set(map);
  }

  setStatus(studentId: string, status: 'present' | 'absent' | 'late'): void {
    this.attendanceMap.set({ ...this.attendanceMap(), [studentId]: status });
  }

  getStatus(studentId: string): 'present' | 'absent' | 'late' {
    return this.attendanceMap()[studentId] ?? 'present';
  }

  getStudentName(student: string | StudentInfo): string {
    if (typeof student === 'object' && student !== null) {
      return [student.firstName, student.lastName].filter(Boolean).join(' ') || 'Unknown';
    }
    return String(student);
  }

  getStudentId(student: string | StudentInfo): string {
    return typeof student === 'object' ? student._id : student;
  }

  getStudentRollNumber(student: string | StudentInfo): string {
    return typeof student === 'object' ? (student.rollNumber || '-') : '-';
  }

  submit(): void {
    if (!this.isReady()) return;
    const records: BulkAttendanceInput[] = this.enrolledStudents().map(s => ({
      studentId: this.getStudentId(s),
      status: this.getStatus(this.getStudentId(s)),
    }));
    this.saving.set(true);
    this.attendanceService.bulkMarkAttendance(
      this.selectedClassroomId(), this.selectedDate(), this.selectedSubject(), records
    ).subscribe({
      next: () => { this.notification.success('Attendance saved successfully'); this.saving.set(false); },
      error: () => { this.notification.error('Failed to save attendance'); this.saving.set(false); },
    });
  }

  back(): void {
    this.router.navigate(['/classrooms/dashboard']);
  }
}
