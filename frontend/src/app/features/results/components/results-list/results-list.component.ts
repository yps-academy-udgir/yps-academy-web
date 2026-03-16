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
import { ExamType } from '../../../../shared/models/student.model';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

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

	loading = signal(false);
	rows = signal<FilteredExamResultRow[]>([]);
	subjectHeaders = computed(() => {
		const headers = new Set<string>();
		for (const row of this.rows()) {
			for (const mark of row.subjectMarks ?? []) {
				headers.add(mark.subject);
			}
		}
		return Array.from(headers);
	});

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

	async downloadPng(): Promise<void> {
		const canvas = await this.captureAsCanvas();
		if (!canvas) return;

		this.downloadDataUrl(canvas.toDataURL('image/png'), 'results-list.png');
	}

	async downloadJpg(): Promise<void> {
		const canvas = await this.captureAsCanvas();
		if (!canvas) return;

		this.downloadDataUrl(canvas.toDataURL('image/jpeg', 0.95), 'results-list.jpg');
	}

	async downloadPdf(): Promise<void> {
		const canvas = await this.captureAsCanvas();
		if (!canvas) return;

		const imageData = canvas.toDataURL('image/png');
		const pdf = new jsPDF('p', 'mm', 'a4');
		const pageWidth = pdf.internal.pageSize.getWidth();
		const pageHeight = pdf.internal.pageSize.getHeight();
		const imgWidth = pageWidth - 20;
		const imgHeight = (canvas.height * imgWidth) / canvas.width;

		if (imgHeight <= pageHeight - 20) {
			pdf.addImage(imageData, 'PNG', 10, 10, imgWidth, imgHeight);
		} else {
			const ratio = (pageHeight - 20) / imgHeight;
			pdf.addImage(imageData, 'PNG', 10, 10, imgWidth * ratio, imgHeight * ratio);
		}

		pdf.save('results-list.pdf');
	}

	private async captureAsCanvas(): Promise<HTMLCanvasElement | null> {
		const container = this.resultsTableContainer?.nativeElement;
		if (!container) {
			return null;
		}

		return html2canvas(container, {
			backgroundColor: '#ffffff',
			scale: 2,
			useCORS: true,
		});
	}

	private downloadDataUrl(dataUrl: string, fileName: string): void {
		const link = document.createElement('a');
		link.href = dataUrl;
		link.download = fileName;
		link.click();
	}
}
