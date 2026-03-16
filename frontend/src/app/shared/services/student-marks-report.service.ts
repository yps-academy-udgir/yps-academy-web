import { Injectable, inject } from '@angular/core';
import { Student, ExamResult } from '../models/student.model';
import { StudentMarksReportData } from '../models/student-marks-report.model';
import { ReportHeaderService } from './report-header.service';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

@Injectable({ providedIn: 'root' })
export class StudentMarksReportService {
  private reportHeaderService = inject(ReportHeaderService);

  buildReport(student: Student, result: ExamResult): StudentMarksReportData {
    const monthLabel = this.getMonthLabel(result.month);
    const classLabel = student.academicDetails?.class ?? '';
    const header = this.reportHeaderService.buildStudentMarksHeader({
      studentName: `${student.firstName} ${student.lastName}`,
      studentId: student._id,
      class: classLabel,
      examType: result.examType,
      month: monthLabel,
      year: result.year,
      generatedOn: new Date().toLocaleString(),
    });

    return {
      header,
      studentId: student._id ?? '',
      studentName: `${student.firstName} ${student.lastName}`,
      studentEmail: student.email,
      contact: student.contact,
      classLabel,
      examResultId: result._id ?? '',
      monthLabel,
      result,
      gradeLabel: this.getGrade(result.percentage),
      statusLabel: result.percentage >= 35 ? 'Pass' : 'Needs Improvement',
    };
  }

  private getMonthLabel(monthValue: number): string {
    return MONTH_NAMES[monthValue - 1] ?? String(monthValue);
  }

  private getGrade(percentage: number): string {
    if (percentage >= 85) return 'A+';
    if (percentage >= 75) return 'A';
    if (percentage >= 60) return 'B';
    if (percentage >= 45) return 'C';
    if (percentage >= 35) return 'D';
    return 'F';
  }
}