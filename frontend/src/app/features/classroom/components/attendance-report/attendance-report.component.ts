import { Component, inject, OnInit, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ClassroomService } from '../../../../shared/services/classroom.service';
import { AttendanceService, AttendanceSummaryRow } from '../../../../shared/services/attendance.service';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-attendance-report',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatTableModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatSelectModule, MatProgressSpinnerModule, MatTooltipModule],
  templateUrl: './attendance-report.component.html',
  styleUrls: ['./attendance-report.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AttendanceReportComponent implements OnInit {
  private classroomService = inject(ClassroomService);
  private attendanceService = inject(AttendanceService);
  private notification = inject(NotificationService);
  private router = inject(Router);

  classrooms = this.classroomService.classrooms;
  loading = signal(false);
  selectedClassroomId = signal('');
  reportData = signal<AttendanceSummaryRow[]>([]);

  displayedColumns = ['student', 'total', 'present', 'absent', 'late', 'percentage', 'status'];

  belowThreshold = computed(() => this.reportData().filter(r => r.percentage < 75).length);

  ngOnInit(): void {
    this.classroomService.getAllClassrooms(1, 100).subscribe();
  }

  loadReport(classroomId: string): void {
    this.selectedClassroomId.set(classroomId);
    if (!classroomId) return;
    this.loading.set(true);
    this.attendanceService.getAttendanceSummary(classroomId).subscribe({
      next: (res) => { this.reportData.set(res.data); this.loading.set(false); },
      error: () => { this.notification.error('Failed to load attendance report'); this.loading.set(false); },
    });
  }

  getStatusColor(pct: number): string {
    if (pct >= 85) return 'green';
    if (pct >= 75) return 'yellow';
    return 'red';
  }

  back(): void {
    this.router.navigate(['/classrooms/dashboard']);
  }
}
