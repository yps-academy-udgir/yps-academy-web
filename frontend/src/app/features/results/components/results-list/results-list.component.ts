import { Component, ChangeDetectionStrategy, ElementRef, ViewChild, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ClassroomService } from '../../../../shared/services/classroom.service';
import { ExamResultService, FilteredExamResultRow } from '../../../../shared/services/exam-result.service';
import { ResultExportFormat, ResultExportService } from '../../../../shared/services/result-export.service';
import { ReportHeaderService } from '../../../../shared/services/report-header.service';
import { ExamType } from '../../../../shared/models/student.model';

@Component({
	selector: 'app-results-list',
	imports: [
		CommonModule,
		MatCardModule,
		MatFormFieldModule,
		MatSelectModule,
		MatInputModule,
		MatButtonModule,
		MatIconModule,
		MatProgressSpinnerModule,
	],
	templateUrl: './results-list.component.html',
	styleUrl: './results-list.component.scss',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResultsListComponent implements OnInit {
	@ViewChild('resultsTableContainer')
	private resultsTableContainer?: ElementRef<HTMLElement>;

	private classroomService = inject(ClassroomService);
	private examResultService = inject(ExamResultService);
	private resultExportService = inject(ResultExportService);
	private reportHeaderService = inject(ReportHeaderService);
	private router = inject(Router);

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
		return [...new Set(this.classrooms().filter((c) => !classValue || c.class === classValue).map((c) => c.section))];
	});

	selectedClass = signal('');
	selectedSection = signal('');
	selectedExamType = signal<ExamType | ''>('');
	selectedMonth = signal(new Date().getMonth() + 1);
	selectedYear = signal(new Date().getFullYear());
	generatedAt = signal(new Date());

	loading = signal(false);
	rows = signal<FilteredExamResultRow[]>([]);
	reportStats = computed(() => {
		const rows = this.rows();
		if (rows.length === 0) {
			return {
				studentCount: 0,
				passCount: 0,
				averagePercentage: 0,
				topPercentage: 0,
			};
		}

		const passCount = rows.filter((row) => row.percentage >= 35).length;
		const averagePercentage = rows.reduce((sum, row) => sum + row.percentage, 0) / rows.length;
		const topPercentage = Math.max(...rows.map((row) => row.percentage));

		return {
			studentCount: rows.length,
			passCount,
			averagePercentage: Number(averagePercentage.toFixed(1)),
			topPercentage: Number(topPercentage.toFixed(1)),
		};
	});
	subjectHeaders = computed(() => {
		const headers = new Set<string>();
		for (const row of this.rows()) {
			for (const mark of row.subjectMarks ?? []) {
				headers.add(mark.subject);
			}
		}
		return Array.from(headers);
	});
	reportMonthLabel = computed(() => this.getMonthLabel(this.selectedMonth()));
	reportExamLabel = computed(() => this.selectedExamType() || 'All Exams');
	reportSectionLabel = computed(() => this.selectedSection() || 'All Sections');
	reportGeneratedOn = computed(() => this.generatedAt().toLocaleString());

	/** Drives the printable export header — single source of truth via ReportHeaderService. */
	reportHeader = computed(() =>
		this.reportHeaderService.buildClassMarksHeader({
			class: this.selectedClass(),
			section: this.reportSectionLabel(),
			examType: this.reportExamLabel(),
			month: this.reportMonthLabel(),
			year: this.selectedYear(),
			totalStudents: this.rows().length,
			generatedOn: this.reportGeneratedOn(),
		}),
	);

	ngOnInit(): void {
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

	goToEnterResults(): void {
		this.router.navigate(['/results/enter']);
	}

	getSubjectMark(row: FilteredExamResultRow, subject: string): string {
		const mark = row.subjectMarks.find((m) => m.subject === subject);
		return mark ? `${mark.marksObtained}/${mark.outOf}` : '-';
	}

	getResultStatus(row: FilteredExamResultRow): 'Pass' | 'Needs Improvement' {
		return row.percentage >= 35 ? 'Pass' : 'Needs Improvement';
	}

	private getMonthLabel(monthValue: number): string {
		return this.months.find((m) => m.value === monthValue)?.label ?? String(monthValue);
	}

	async downloadPng(): Promise<void> {
		await this.exportResults('png');
	}

	async downloadJpg(): Promise<void> {
		await this.exportResults('jpg');
	}

	async downloadPdf(): Promise<void> {
		await this.exportResults('pdf');
	}

	private async exportResults(format: ResultExportFormat): Promise<void> {
		const container = this.resultsTableContainer?.nativeElement;
		if (!container) {
			return;
		}

		const header = this.reportHeaderService.buildClassMarksHeader({
			class: this.selectedClass(),
			section: this.reportSectionLabel(),
			examType: this.reportExamLabel(),
			month: this.reportMonthLabel(),
			year: this.selectedYear(),
			totalStudents: this.rows().length,
			generatedOn: this.reportGeneratedOn(),
		});

		await this.resultExportService.export(container, {
			format,
			fileBaseName: this.getExportFileBaseName(),
			metadata: {
				academyName: header.academyName,
				reportTitle: header.reportTitle,
				classLabel: header.class,
				sectionLabel: header.section,
				examLabel: header.examType,
				periodLabel: `${header.month} ${header.year}`,
				generatedOn: header.generatedOn,
			},
		});
	}

	private getExportFileBaseName(): string {
		const classPart = (this.selectedClass() || 'results').replace(/\s+/g, '-').toLowerCase();
		const sectionPart = this.reportSectionLabel().replace(/\s+/g, '-').toLowerCase();
		const examPart = this.reportExamLabel().replace(/\s+/g, '-').toLowerCase();
		const monthPart = this.reportMonthLabel().replace(/\s+/g, '-').toLowerCase();
		return `${classPart}-${sectionPart}-${examPart}-${monthPart}-${this.selectedYear()}-report`;
	}
}
