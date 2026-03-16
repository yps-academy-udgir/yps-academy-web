import { ChangeDetectionStrategy, Component, computed, inject, input, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { ClassroomService } from '../../../shared/services/classroom.service';
import { ExamResultService, BulkMarksPayload } from '../../../shared/services/exam-result.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ExamType, SubjectMark } from '../../../shared/models/student.model';
import { StudentInfo } from '../../../features/classroom/models/classroom.model';

@Component({
	selector: 'app-marks-entry',
	imports: [
		CommonModule,
		FormsModule,
		MatCardModule,
		MatButtonModule,
		MatIconModule,
		MatFormFieldModule,
		MatSelectModule,
		MatInputModule,
		MatProgressSpinnerModule,
		MatDividerModule,
	],
	templateUrl: './marks-entry.component.html',
	styleUrl: './marks-entry.component.scss',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MarksEntryComponent implements OnInit {
	readonly title = input('Enter Marks');
	readonly backRoute = input('/classrooms/dashboard');
	readonly saveButtonLabel = input('Save Marks');
	readonly successLabel = input('Marks');
	readonly errorLabel = input('marks');

	private classroomService = inject(ClassroomService);
	private examResultService = inject(ExamResultService);
	private notification = inject(NotificationService);
	private router = inject(Router);

	readonly examTypes = Object.values(ExamType);
	readonly months = [
		{ value: 1, label: 'January' }, { value: 2, label: 'February' },
		{ value: 3, label: 'March' },   { value: 4, label: 'April' },
		{ value: 5, label: 'May' },     { value: 6, label: 'June' },
		{ value: 7, label: 'July' },    { value: 8, label: 'August' },
		{ value: 9, label: 'September' },{ value: 10, label: 'October' },
		{ value: 11, label: 'November' },{ value: 12, label: 'December' },
	];

	classrooms = this.classroomService.classrooms;
	selectedClassroomId = signal('');
	selectedExamType = signal<ExamType | ''>('');
	selectedMonth = signal(new Date().getMonth() + 1);
	selectedYear = signal(new Date().getFullYear());
	customSubjectInput = signal('');
	saving = signal(false);
	loading = signal(false);
	maxMarksMap = signal<Record<string, number>>({});
	marksMap = signal<Record<string, Record<string, number>>>({});
	customSubjects = signal<string[]>([]);
	selectedSubjects = signal<string[]>([]);

	selectedClassroom = computed(() =>
		this.classrooms().find(c => c._id === this.selectedClassroomId()) ?? null
	);

	subjects = computed((): string[] => {
		const c = this.selectedClassroom();
		if (!c) return [];
		return [...new Set(c.facultyAssignments.map(fa => fa.subject as string))];
	});

	availableSubjects = computed((): string[] => {
		return [...new Set([...this.subjects(), ...this.customSubjects()])];
	});

	enrolledStudents = computed(() => this.selectedClassroom()?.enrolledStudents ?? []);

	isFilterReady = computed(() =>
		!!this.selectedClassroomId() &&
		!!this.selectedExamType() &&
		!!this.selectedMonth() &&
		!!this.selectedYear()
	);

	allMaxMarksFilled = computed(() => {
		const subs = this.selectedSubjects();
		const maxMap = this.maxMarksMap();
		return subs.length > 0 && subs.every(s => (maxMap[s] ?? 0) > 0);
	});

	totalMaxMarks = computed(() => {
		const maxMap = this.maxMarksMap();
		return this.selectedSubjects().reduce((sum, subject) => sum + (maxMap[subject] || 0), 0);
	});

	ngOnInit(): void {
		this.classroomService.getAllClassrooms(1, 100).subscribe();
	}

	onClassroomChange(id: string): void {
		this.selectedClassroomId.set(id);
		this.maxMarksMap.set({});
		this.marksMap.set({});
		this.customSubjects.set([]);
		const classroom = this.classrooms().find(c => c._id === id);
		const defaultSubjects = classroom
			? [...new Set(classroom.facultyAssignments.map(fa => fa.subject as string))]
			: [];
		this.selectedSubjects.set(defaultSubjects);
		this.customSubjectInput.set('');
	}

	onSelectedSubjectsChange(values: string[]): void {
		this.selectedSubjects.set(values ?? []);
	}

	addCustomSubject(): void {
		const rawValue = this.customSubjectInput().trim();
		if (!rawValue) return;

		const normalized = rawValue
			.split(' ')
			.filter(Boolean)
			.map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
			.join(' ');

		const existing = new Set(this.availableSubjects().map(s => s.toLowerCase()));
		if (!existing.has(normalized.toLowerCase())) {
			this.customSubjects.set([...this.customSubjects(), normalized]);
		}

		if (!this.selectedSubjects().includes(normalized)) {
			this.selectedSubjects.set([...this.selectedSubjects(), normalized]);
		}

		this.customSubjectInput.set('');
	}

	onFilterChange(): void {
		if (!this.isFilterReady()) return;
		this.loadExistingMarks();
	}

	private loadExistingMarks(): void {
		const cid = this.selectedClassroomId();
		const et = this.selectedExamType() as ExamType;
		if (!cid || !et) return;

		this.loading.set(true);
		this.examResultService
			.getByClassroom(cid, et, this.selectedMonth(), this.selectedYear())
			.subscribe({
				next: (res) => {
					const newMarksMap: Record<string, Record<string, number>> = {};
					const newMaxMap: Record<string, number> = {};
					const loadedSubjects = new Set<string>();

					for (const result of res.data ?? []) {
						const sid = typeof result.studentId === 'object'
							? (result.studentId as unknown as { _id: string })._id
							: result.studentId;
						newMarksMap[sid] = {};
						for (const sm of result.subjectMarks) {
							loadedSubjects.add(sm.subject);
							newMarksMap[sid][sm.subject] = sm.marksObtained;
							if (!newMaxMap[sm.subject] && sm.outOf > 0) {
								newMaxMap[sm.subject] = sm.outOf;
							}
						}
					}

					const baseSubjects = new Set(this.subjects());
					const missingCustom = [...loadedSubjects].filter(subject => !baseSubjects.has(subject));
					if (missingCustom.length > 0) {
						this.customSubjects.set([...new Set([...this.customSubjects(), ...missingCustom])]);
					}

					if (loadedSubjects.size > 0) {
						this.selectedSubjects.set([...new Set([...this.selectedSubjects(), ...loadedSubjects])]);
					}

					this.marksMap.set(newMarksMap);
					this.maxMarksMap.set(newMaxMap);
					this.loading.set(false);
				},
				error: () => this.loading.set(false),
			});
	}

	setMaxMarks(subject: string, value: string): void {
		const num = parseInt(value, 10);
		this.maxMarksMap.set({ ...this.maxMarksMap(), [subject]: isNaN(num) ? 0 : num });
	}

	setMark(studentId: string, subject: string, value: string): void {
		const num = parseFloat(value);
		const current = this.marksMap();
		this.marksMap.set({
			...current,
			[studentId]: { ...(current[studentId] ?? {}), [subject]: isNaN(num) ? 0 : num },
		});
	}

	getMark(studentId: string, subject: string): number {
		return this.marksMap()[studentId]?.[subject] ?? 0;
	}

	getMaxMarksValue(subject: string): number | '' {
		const value = this.maxMarksMap()[subject];
		return value && value > 0 ? value : '';
	}

	getTotal(studentId: string): number {
		const row = this.marksMap()[studentId] ?? {};
		return Object.values(row).reduce((s, v) => s + (v || 0), 0);
	}

	getPercentage(studentId: string): number {
		const total = this.totalMaxMarks();
		return total > 0 ? parseFloat(((this.getTotal(studentId) / total) * 100).toFixed(1)) : 0;
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

	submit(): void {
		if (!this.isFilterReady() || !this.allMaxMarksFilled()) return;

		const subjs = this.selectedSubjects();
		const maxMap = this.maxMarksMap();

		const records = this.enrolledStudents().map(student => {
			const sid = this.getStudentId(student);
			const subjectMarks: SubjectMark[] = subjs.map(subj => ({
				subject: subj,
				outOf: maxMap[subj],
				marksObtained: this.getMark(sid, subj),
			}));
			return { studentId: sid, subjectMarks };
		});

		const payload: BulkMarksPayload = {
			classroomId: this.selectedClassroomId(),
			examType: this.selectedExamType() as ExamType,
			month: this.selectedMonth(),
			year: this.selectedYear(),
			records,
		};

		this.saving.set(true);
		this.examResultService.bulkSave(payload).subscribe({
			next: (res) => {
				this.notification.success(`${this.successLabel()} saved for ${res.data?.count ?? records.length} students`);
				this.saving.set(false);
			},
			error: (err) => {
				this.notification.error(err.message || `Failed to save ${this.errorLabel()}`);
				this.saving.set(false);
			},
		});
	}

	back(): void {
		this.router.navigate([this.backRoute()]);
	}
}
