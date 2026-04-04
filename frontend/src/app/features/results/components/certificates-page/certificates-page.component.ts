import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  TemplateRef,
  ViewChild,
  computed,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ClassroomService } from '../../../../shared/services/classroom.service';
import {
  ExamResultService,
  FilteredExamResultRow,
} from '../../../../shared/services/exam-result.service';
import {
  ResultExportFormat,
  ResultExportService,
} from '../../../../shared/services/result-export.service';
import { ReportHeaderService } from '../../../../shared/services/report-header.service';
import { ExamType } from '../../../../shared/models/student.model';
import {
  AwardCertificateComponent,
  AwardCertificateData,
} from '../../../../shared/components/award-certificate/award-certificate.component';

interface RankedResultRow extends FilteredExamResultRow {
  rank: number;
}

@Component({
  selector: 'app-certificates-page',
  imports: [
    CommonModule,
    MatCardModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatMenuModule,
    MatDialogModule,
    AwardCertificateComponent,
  ],
  templateUrl: './certificates-page.component.html',
  styleUrl: './certificates-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CertificatesPageComponent {
  @ViewChild('bulkExportContainer')
  private bulkExportContainer?: ElementRef<HTMLElement>;

  @ViewChild('singleExportContainer')
  private singleExportContainer?: ElementRef<HTMLElement>;

  @ViewChild('certificateDialogTpl')
  private certificateDialogTpl?: TemplateRef<unknown>;

  private classroomService = inject(ClassroomService);
  private examResultService = inject(ExamResultService);
  private resultExportService = inject(ResultExportService);
  private reportHeaderService = inject(ReportHeaderService);
  private dialog = inject(MatDialog);

  readonly examTypes = Object.values(ExamType);
  readonly months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' },
  ];

  classrooms = this.classroomService.classrooms;
  classOptions = computed(() => [...new Set(this.classrooms().map((c) => c.class))]);
  sectionOptions = computed(() => {
    const classValue = this.selectedClass();
    return [
      ...new Set(
        this.classrooms()
          .filter((c) => !classValue || c.class === classValue)
          .map((c) => c.section)
      ),
    ];
  });

  selectedClass = signal('');
  selectedSection = signal('');
  selectedExamType = signal<ExamType | ''>('');
  selectedMonth = signal(new Date().getMonth() + 1);
  selectedYear = signal(new Date().getFullYear());

  certificateTitle = signal('Certificate of Excellence');
  messageTemplate = signal(
    'Congratulations {name}! You have secured Rank {rank} with {percentage}% in {examType} ({month} {year}). Keep up your excellent work.'
  );
  scope = signal<'top3' | 'all'>('all');

  loading = signal(false);
  exporting = signal(false);
  rows = signal<FilteredExamResultRow[]>([]);
  generatedAt = signal(new Date());
  selectedRowForExport = signal<RankedResultRow | null>(null);
  selectedRowForPreview = signal<RankedResultRow | null>(null);

  rankedRows = computed<RankedResultRow[]>(() => {
    const sorted = [...this.rows()].sort((a, b) => {
      if (b.percentage !== a.percentage) return b.percentage - a.percentage;
      if (b.totalMarksObtained !== a.totalMarksObtained) {
        return b.totalMarksObtained - a.totalMarksObtained;
      }
      return a.studentName.localeCompare(b.studentName);
    });

    return sorted.map((row, index) => ({ ...row, rank: index + 1 }));
  });

  activeRows = computed(() => {
    const allRows = this.rankedRows();
    return this.scope() === 'top3' ? allRows.slice(0, 3) : allRows;
  });

  academyMeta = computed(() => this.reportHeaderService.getAcademyMeta());

  certificates = computed<AwardCertificateData[]>(() =>
    this.activeRows().map((row) => this.toCertificateData(row))
  );

  selectedCertificate = computed<AwardCertificateData | null>(() => {
    const row = this.selectedRowForExport();
    return row ? this.toCertificateData(row) : null;
  });

  previewCertificate = computed<AwardCertificateData | null>(() => {
    const row = this.selectedRowForPreview();
    return row ? this.toCertificateData(row) : null;
  });

  constructor() {
    this.classroomService.getAllClassrooms(1, 100).subscribe();
  }

  search(): void {
    if (!this.selectedClass()) {
      return;
    }

    this.loading.set(true);
    this.examResultService
      .getFilteredResults({
        classValue: this.selectedClass(),
        section: this.selectedSection() || undefined,
        examType: this.selectedExamType() || undefined,
        month: this.selectedMonth(),
        year: this.selectedYear(),
      })
      .subscribe({
        next: (res) => {
          this.rows.set(res.data ?? []);
          this.generatedAt.set(new Date());
          this.loading.set(false);
        },
        error: () => {
          this.rows.set([]);
          this.loading.set(false);
        },
      });
  }

  setScope(scope: 'top3' | 'all'): void {
    this.scope.set(scope);
  }

  async downloadAllPdf(): Promise<void> {
    await this.exportAll('pdf');
  }

  async downloadAllPng(): Promise<void> {
    await this.exportAll('png');
  }

  async downloadAllJpg(): Promise<void> {
    await this.exportAll('jpg');
  }

  async downloadRowCertificate(row: RankedResultRow, format: ResultExportFormat): Promise<void> {
    this.exporting.set(true);
    this.selectedRowForExport.set(row);

    try {
      await new Promise((resolve) => setTimeout(resolve, 0));

      const container = this.singleExportContainer?.nativeElement;
      if (!container) return;

      const cert = this.toCertificateData(row);
      await this.resultExportService.export(container, {
        format,
        fileBaseName: `certificate-rank${row.rank}-${row.studentName.replace(/\s+/g, '-').toLowerCase()}`,
        metadata: {
          academyName: cert.academyName,
          reportTitle: cert.certificateTitle,
          studentName: cert.studentName,
          classLabel: cert.class,
          examLabel: cert.examType,
          periodLabel: `${cert.monthLabel} ${cert.year}`,
          generatedOn: this.generatedAt().toLocaleString(),
        },
        backgroundColor: '#ffffff',
        scale: 2,
      });
    } finally {
      this.selectedRowForExport.set(null);
      this.exporting.set(false);
    }
  }

  openCertificateDialog(row: RankedResultRow): void {
    this.selectedRowForPreview.set(row);
    if (!this.certificateDialogTpl) return;

    this.dialog.open(this.certificateDialogTpl, {
      width: '780px',
      maxWidth: '96vw',
      maxHeight: '90vh',
    });
  }

  closeCertificateDialog(): void {
    this.dialog.closeAll();
  }

  private async exportAll(format: ResultExportFormat): Promise<void> {
    if (this.certificates().length === 0) {
      return;
    }

    this.exporting.set(true);

    try {
      // Wait one tick so hidden export DOM is fully rendered with latest title/message/scope.
      await new Promise((resolve) => setTimeout(resolve, 0));

      const container = this.bulkExportContainer?.nativeElement;
      if (!container) {
        return;
      }

      const monthLabel = this.getMonthLabel(this.selectedMonth());
      const examLabel = this.selectedExamType() || 'All Exams';
      const sectionLabel = this.selectedSection() || 'All Sections';

      await this.resultExportService.export(container, {
        format,
        fileBaseName: this.getExportFileBaseName(),
        metadata: {
          academyName: this.academyMeta().academyName,
          reportTitle: this.certificateTitle(),
          classLabel: this.selectedClass(),
          sectionLabel,
          examLabel,
          periodLabel: `${monthLabel} ${this.selectedYear()}`,
          generatedOn: this.generatedAt().toLocaleString(),
        },
        backgroundColor: '#ffffff',
        scale: 2,
      });
    } finally {
      this.exporting.set(false);
    }
  }

  private interpolateMessage(row: RankedResultRow): string {
    const values: Record<string, string> = {
      name: row.studentName,
      rank: String(row.rank),
      percentage: row.percentage.toFixed(1),
      class: row.class,
      section: row.section,
      examType: row.examType,
      month: this.getMonthLabel(row.month),
      year: String(row.year),
      total: String(row.totalMarksObtained),
      outOf: String(row.totalOutOf),
    };

    return this.messageTemplate().replace(/\{(\w+)\}/g, (match, key) => values[key] ?? match);
  }

  private toCertificateData(row: RankedResultRow): AwardCertificateData {
    return {
      rank: row.rank,
      studentName: row.studentName,
      // Support both `studentImage` and legacy `image` response keys.
      studentImage: (row as any).studentImage ?? (row as any).image ?? null,
      percentage: row.percentage,
      totalMarksObtained: row.totalMarksObtained,
      totalOutOf: row.totalOutOf,
      class: row.class,
      examType: row.examType,
      monthLabel: this.getMonthLabel(row.month),
      year: row.year,
      certificateTitle: this.certificateTitle(),
      message: this.interpolateMessage(row),
      academyName: this.academyMeta().academyName,
    };
  }

  private getMonthLabel(monthValue: number): string {
    return this.months.find((m) => m.value === monthValue)?.label ?? String(monthValue);
  }

  private getExportFileBaseName(): string {
    const classPart = (this.selectedClass() || 'certificates').replace(/\s+/g, '-').toLowerCase();
    const sectionPart = (this.selectedSection() || 'all-sections').replace(/\s+/g, '-').toLowerCase();
    const examPart = (this.selectedExamType() || 'all-exams').replace(/\s+/g, '-').toLowerCase();
    const monthPart = this.getMonthLabel(this.selectedMonth()).replace(/\s+/g, '-').toLowerCase();
    return `${classPart}-${sectionPart}-${examPart}-${monthPart}-${this.selectedYear()}-${this.scope()}-certificates`;
  }
}
