import { ChangeDetectionStrategy, Component, ElementRef, ViewChild, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { StudentMarksReportData } from '../../models/student-marks-report.model';
import { ResultExportService } from '../../services/result-export.service';

@Component({
  selector: 'app-student-marks-report',
  imports: [CommonModule, MatButtonModule, MatIconModule],
  templateUrl: './student-marks-report.component.html',
  styleUrl: './student-marks-report.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StudentMarksReportComponent {
  readonly report = input.required<StudentMarksReportData>();

  @ViewChild('reportContainer')
  private reportContainer?: ElementRef<HTMLElement>;

  private exportService = inject(ResultExportService);

  async downloadPdf(): Promise<void> {
    await this.export('pdf');
  }

  async downloadPng(): Promise<void> {
    await this.export('png');
  }

  getSubjectPercentage(obtained: number, outOf: number): number {
    if (!outOf) {
      return 0;
    }
    return Number(((obtained / outOf) * 100).toFixed(1));
  }

  private async export(format: 'pdf' | 'png'): Promise<void> {
    const container = this.reportContainer?.nativeElement;
    if (!container) {
      return;
    }

    const report = this.report();
    await this.exportService.export(container, {
      format,
      fileBaseName: `marks-report-${report.studentId}-${report.examResultId}`,
      metadata: {
        academyName: report.header.academyName,
        reportTitle: report.header.reportTitle,
        studentName: report.studentName,
        classLabel: report.classLabel,
        examLabel: report.result.examType,
        periodLabel: `${report.monthLabel} ${report.result.year}`,
        generatedOn: report.header.generatedOn,
      },
    });
  }
}