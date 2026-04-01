import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Student } from '../../../../shared/models/student.model';
import { ExamResult } from '../../../../shared/models/student.model';
import { StudentService } from '../../../../shared/services/student.service';
import { ExamResultService } from '../../../../shared/services/exam-result.service';
import { StudentMarksReportService } from '../../../../shared/services/student-marks-report.service';
import { StudentMarksReportComponent } from '../../../../shared/components/student-marks-report/student-marks-report.component';
import { LoadingComponent } from '../../../../shared/components/loading/loading.component';
import { ErrorMessageComponent } from '../../../../shared/components/error-message/error-message.component';
import { RoleService } from '../../../../shared/services/role.service';

@Component({
  selector: 'app-student-marks-report-page',
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    LoadingComponent,
    ErrorMessageComponent,
    StudentMarksReportComponent,
  ],
  templateUrl: './student-marks-report-page.component.html',
  styleUrl: './student-marks-report-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StudentMarksReportPageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private studentService = inject(StudentService);
  private examResultService = inject(ExamResultService);
  private studentMarksReportService = inject(StudentMarksReportService);
  private roleService = inject(RoleService);

  student = signal<Student | null>(null);
  result = signal<ExamResult | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);

  reportData = computed(() => {
    const student = this.student();
    const result = this.result();
    if (!student || !result) {
      return null;
    }
    return this.studentMarksReportService.buildReport(student, result);
  });

  ngOnInit(): void {
    const studentId = this.route.snapshot.paramMap.get('studentId');
    const resultId = this.route.snapshot.paramMap.get('resultId');
    if (!studentId || !resultId) {
      this.router.navigate(['/students', 'management', 'list']);
      return;
    }

    this.loadData(studentId, resultId);
  }

  onBack(): void {
    if (this.roleService.isStudent()) {
      this.router.navigate(['/my-marks']);
      return;
    }
    const student = this.student();
    if (student?._id) {
      this.router.navigate(['/students', 'management', student._id]);
      return;
    }
    this.router.navigate(['/students', 'management', 'list']);
  }

  onRetry(): void {
    const studentId = this.route.snapshot.paramMap.get('studentId');
    const resultId = this.route.snapshot.paramMap.get('resultId');
    if (studentId && resultId) {
      this.loadData(studentId, resultId);
    }
  }

  private loadData(studentId: string, resultId: string): void {
    this.loading.set(true);
    this.error.set(null);

    const studentObs = this.roleService.isStudent()
      ? this.studentService.getMe()
      : this.studentService.getStudentById(studentId);

    forkJoin({
      studentResponse: studentObs,
      resultResponse: this.examResultService.getById(resultId),
    }).subscribe({
      next: ({ studentResponse, resultResponse }) => {
        if (!studentResponse.data || !resultResponse.data) {
          this.error.set('Student report could not be loaded.');
        } else {
          this.student.set(studentResponse.data);
          this.result.set(resultResponse.data);
        }
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load the student marks report.');
        this.loading.set(false);
      },
    });
  }
}