/**
 * Student Form Component
 * Simplified form for creating and editing students
 * Uses Angular Reactive Forms with Material Design
 * Follows Angular 20 patterns with signals
 */
import { Component, OnInit, OnDestroy, inject, signal, computed, effect } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';

import { SharedMaterialModule } from '../../../../shared/shared-material.module';
import { StudentService } from '../../../../shared/services/student.service';
import { ClassroomService } from '../../../../shared/services/classroom.service';
import { SubjectConfigService } from '../../../../shared/services/subject-config.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { RoleService } from '../../../../shared/services/role.service';
import { LoadingComponent } from '../../../../shared/components/loading/loading.component';
import { Student, Gender, Class, Payment } from '../../../../shared/models/student.model';
import { Classroom } from '../../../classroom/models/classroom.model';
import { calculateFees, calculatePendingFees, calculateTotalPaid } from '../../../../shared/utils/fee-calculator.util';
import { CredentialsDialogComponent } from '../../../../shared/components/credentials-dialog/credentials-dialog.component';
import { Subject , takeUntil } from 'rxjs';
import { NumericFormatDirective } from '../../../../shared/directives/numeric-format.directive';

@Component({
  selector: 'app-student-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SharedMaterialModule,
    RouterLink,
    LoadingComponent,
    NumericFormatDirective,
  ],
  templateUrl: './student-form.component.html',
  styleUrls: ['./student-form.component.scss'],
})
export class StudentFormComponent implements OnInit, OnDestroy {
  // Inject services using Angular's inject() function
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private studentService = inject(StudentService);
  private classroomService = inject(ClassroomService);
  private notificationService = inject(NotificationService);
  private dialog = inject(MatDialog);
  private roleService = inject(RoleService);
  subjectConfigService = inject(SubjectConfigService);

  isAdmin = this.roleService.isAdmin;

  // Signals for reactive state
  studentId = signal<string | null>(null);
  loading = signal<boolean>(false);
  submitting = signal<boolean>(false);
  classrooms = signal<Classroom[]>([]);
  classroomsLoading = signal<boolean>(false);
  selectedClass = signal<string | null>(null);

  /** Classrooms that match the selected class AND still have free seats */
  availableClassrooms = computed(() => {
    const cls = this.selectedClass();
    if (!cls) return [];
    return this.classrooms().filter(
      c => c.class === cls && c.enrolledStudents.length < c.capacity
    );
  });

  // Computed signals
  isEditMode = computed(() => this.studentId() !== null);
  pageTitle = computed(() => this.isEditMode() ? 'Edit Student' : 'Add New Student');
  submitButtonText = computed(() => this.isEditMode() ? 'Update Student' : 'Create Student');

  // Image upload signals
  selectedFile = signal<File | null>(null);
  imagePreviewUrl = signal<string | null>(null);
  existingImageUrl = signal<string | null>(null);

  // Fee-related signals
  calculatedFees = signal<number>(0);
  paidAmount = signal<number>(0);
  pendingFees = computed(() => calculatePendingFees(this.calculatedFees(), this.paidAmount()));
  destroy$ = new Subject<void>();
  // Stepper form groups (for step control)
  get studentInfoGroup() {
    return this.fb.group({
      firstName: this.studentForm?.get('firstName'),
      lastName: this.studentForm?.get('lastName'),
      email: this.studentForm?.get('email'),
      contact: this.studentForm?.get('contact'),
      gender: this.studentForm?.get('gender'),
    });
  }

  get academicDetailsGroup() {
    return this.studentForm?.get('academicDetails') as FormGroup;
  }

  get feeDetailsGroup() {
    return this.studentForm?.get('feeDetails') as FormGroup;
  }

  // Form group
  studentForm!: FormGroup;

  // Gender options
  genderOptions = [
    { value: Gender.MALE, label: 'Male' },
    { value: Gender.FEMALE, label: 'Female' },
  ];

  // Class options
  classOptions = [
    { value: Class.FIFTH, label: '5th' },
    { value: Class.SIXTH, label: '6th' },
    { value: Class.SEVENTH, label: '7th' },
    { value: Class.EIGHTH, label: '8th' },
    { value: Class.NINTH, label: '9th' },
    { value: Class.TENTH, label: '10th' },
  ];

  // Subject options — filtered by selected class, from SubjectConfig API
  get availableSubjects() {
    const cls = this.selectedClass();
    if (!cls) return [];
    return this.subjectConfigService.getSubjectsForClass(cls);
  }

  // App starts 2026 — no historical entries; grows by 1 each year automatically
  currentYear = new Date().getFullYear();
  yearRange = Array.from(
    { length: Math.max(1, this.currentYear - 2025) },
    (_, i) => this.formatAcademicSession(2026 + i)
  );
  
  ngOnInit(): void {
    this.initializeForm();
    this.loadClassrooms();
    this.loadSubjectConfig();
    this.checkEditMode();
    this.setupFeeCalculation();
  }
    ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadSubjectConfig(): void {
    this.subjectConfigService.get().subscribe();
  }

  private loadClassrooms(): void {
    this.classroomsLoading.set(true);
    this.classroomService.getAllClassrooms(1, 200).subscribe({
      next: (response) => {
        this.classrooms.set(response.data);
      },
      error: () => {
        this.classrooms.set([]);
      },
      complete: () => {
        this.classroomsLoading.set(false);
      },
    });
  }

  /**
   * Initialize the reactive form with simplified fields
   */
  private initializeForm(): void {
    this.studentForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      lastName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email]],
      contact: ['', [Validators.required, Validators.pattern(/^\+?[\d\s-]{10,15}$/)]],
      gender: ['', Validators.required],
      academicDetails: this.fb.group({
        yearOfAdmission: ['', Validators.required],
        class: ['', Validators.required],
        classroomId: [null], // optional — shown when >1 room available
        subjects: [[]],
        selfStudyMode: [false],
      }),
      feeDetails: this.fb.group({
        totalFees: [{ value: 0, disabled: true }],
        paidAmount: [0],
        pendingFees: [{ value: 0, disabled: true }],
        discount: [0, [Validators.min(0)]],
        feeBreakdown: this.fb.group({
          baseFeePerSubject: [0],
          numberOfSubjects: [0],
          subjectsFee: [0],
          selfStudyFee: [0],
          discount: [0],
        }),
        paymentHistory: [[]],
        initialPayment: [0, [Validators.min(0)]],
        paymentDate: [new Date()],
        paymentRemarks: [''],
      }),
    });
  }

  private formatAcademicSession(startYear: number): string {
    return `${startYear}-${startYear + 1}`;
  }

  /**
   * Setup fee calculation reactivity
   */
  private setupFeeCalculation(): void {
    // Watch class changes: clear subject selection + recalculate
    this.studentForm.get('academicDetails.class')?.valueChanges.pipe(takeUntil(this.destroy$)).subscribe((cls) => {
      this.selectedClass.set(cls ?? null);
      // Clear subjects that are no longer valid for the new class
      this.studentForm.get('academicDetails.subjects')?.setValue([]);});
    // Watch remaining academic fields (selfStudyMode, subjects)
    this.studentForm.get('academicDetails')?.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => this.recalculateFees());
    this.studentForm.get('feeDetails.discount')?.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.recalculateFees();
    });
  }

  /**
   * Recalculate fees based on class, subjects, and self-study mode
   */
  private recalculateFees(): void {
    const academicDetails = this.studentForm.get('academicDetails')?.value;
    const subjects: string[] = academicDetails?.subjects || [];
    const selfStudyMode: boolean = academicDetails?.selfStudyMode || false;
    const discount: number = this.studentForm.get('feeDetails.discount')?.value || 0;
    const cls: string = academicDetails?.class || '';

    const feeMap = this.subjectConfigService.getFeeMapForClass(cls);
    const selfStudyFee = this.subjectConfigService.subjectConfig()?.selfStudyFee ?? 0;

    const feeCalculation = calculateFees(subjects, selfStudyMode, feeMap, selfStudyFee, discount);

    // Update fee breakdown
    this.studentForm.get('feeDetails.feeBreakdown')?.patchValue({
      baseFeePerSubject: feeCalculation.baseFeePerSubject,
      numberOfSubjects: feeCalculation.numberOfSubjects,
      subjectsFee: feeCalculation.subjectsFee,
      selfStudyFee: feeCalculation.selfStudyFee,
      discount: feeCalculation.discount,
    });

    // Update total fees
    this.studentForm.get('feeDetails.totalFees')?.setValue(feeCalculation.totalFees);
    this.calculatedFees.set(feeCalculation.totalFees);

    // Calculate pending fees
    const paid = this.paidAmount();
    const pending = calculatePendingFees(feeCalculation.totalFees, paid);
    this.studentForm.get('feeDetails.pendingFees')?.setValue(pending);
  }

  /**
   * Check if in edit mode and load student data
   */
  private checkEditMode(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.studentId.set(id);
      this.loadStudentData(id);
    }
  }

  /**
   * Load student data for editing
   */
  private loadStudentData(id: string): void {
    this.loading.set(true);
    this.studentService.getStudentById(id).subscribe({
      next: (response) => {
        if (response.data) {
          this.patchFormValues(response.data);
        }
        this.loading.set(false);
      },
      error: (error) => {
        this.notificationService.error('Failed to load student data');
        this.loading.set(false);
        this.router.navigate(['/students', 'management', 'list']);
      },
    });
  }

  /**
   * Patch form with student data
   */
  private patchFormValues(student: Student): void {
    // Sync selectedClass signal so subject dropdown populates correctly
    this.selectedClass.set(student.academicDetails?.class ?? null);

    this.studentForm.patchValue({
      firstName: student.firstName,
      lastName: student.lastName,
      email: student.email,
      contact: student.contact,
      gender: student.gender,
      academicDetails: {
        yearOfAdmission: student.academicDetails?.yearOfAdmission || '',
        class: student.academicDetails?.class || '',
        subjects: student.academicDetails?.subjects || [],
        selfStudyMode: student.academicDetails?.selfStudyMode || false,
      },
    });

    // Patch fee details if they exist
    if (student.image) {
      this.existingImageUrl.set(
        environment.apiUrl.replace('/api', '') + student.image
      );
    }

    if (student.feeDetails) {
      const totalPaid = calculateTotalPaid(student.feeDetails.paymentHistory || []);
      this.paidAmount.set(totalPaid);

      this.studentForm.patchValue({
        feeDetails: {
          totalFees: student.feeDetails.totalFees || 0,
          paidAmount: totalPaid,
          pendingFees: student.feeDetails.pendingFees || 0,
          feeBreakdown: student.feeDetails.feeBreakdown || {},
          paymentHistory: student.feeDetails.paymentHistory || [],
        },
      });

      this.calculatedFees.set(student.feeDetails.totalFees || 0);
    } else {
      // Trigger recalculation if no fee details exist
      this.recalculateFees();
    }
  }

  /**
   * Add a new payment to the payment history
   */
  addPayment(): void {
    const initialPayment = this.studentForm.get('feeDetails.initialPayment')?.value;
    const paymentDate = this.studentForm.get('feeDetails.paymentDate')?.value;
    const paymentRemarks = this.studentForm.get('feeDetails.paymentRemarks')?.value;

    if (!initialPayment || initialPayment <= 0) {
      this.notificationService.warning('Please enter a valid payment amount');
      return;
    }

    const paymentHistory: Payment[] = this.studentForm.get('feeDetails.paymentHistory')?.value || [];
    const newPayment: Payment = {
      amount: initialPayment,
      paymentDate: paymentDate || new Date(),
      remarks: paymentRemarks || '',
    };

    paymentHistory.push(newPayment);
    this.studentForm.get('feeDetails.paymentHistory')?.setValue(paymentHistory);

    // Update paid amount
    const totalPaid = calculateTotalPaid(paymentHistory);
    this.paidAmount.set(totalPaid);
    this.studentForm.get('feeDetails.paidAmount')?.setValue(totalPaid);

    // Recalculate pending fees
    const pending = calculatePendingFees(this.calculatedFees(), totalPaid);
    this.studentForm.get('feeDetails.pendingFees')?.setValue(pending);

    // Reset payment fields
    this.studentForm.patchValue({
      feeDetails: {
        initialPayment: 0,
        paymentDate: new Date(),
        paymentRemarks: '',
      },
    });

    this.notificationService.success('Payment added successfully');
  }

  /**
   * Handle form submission
   */
  onSubmit(): void {
    if (this.studentForm.invalid) {
      this.studentForm.markAllAsTouched();
      this.notificationService.warning('Please fill in all required fields correctly');
      return;
    }

    if (!this.isEditMode()) {
      const selectedClass = this.studentForm.get('academicDetails.class')?.value as string | null;
      if (selectedClass && !this.hasAvailableClassroom(selectedClass)) {
        this.notificationService.warning(`No classroom is available for class ${selectedClass}. Please add a classroom first.`);
        return;
      }
    }

    this.submitting.set(true);
    const payload = this.buildSubmitPayload();

    if (this.isEditMode()) {
      this.updateStudent(payload);
    } else {
      this.createStudent(payload);
    }
  }

  /**
   * Prepare form data before submission
   */
  private prepareFormData(): Partial<Student> & { classroomId?: string } {
    const formValue = this.studentForm.getRawValue(); // Use getRawValue to include disabled fields
    
    // Hoist classroomId to the top level so the backend can read it directly
    const classroomId: string | null = formValue.academicDetails?.classroomId || null;
    if (formValue.academicDetails) {
      delete formValue.academicDetails.classroomId;
    }

    // Add initial payment to payment history if it exists and is greater than 0
    const initialPayment = formValue.feeDetails?.initialPayment;
    const paymentDate = formValue.feeDetails?.paymentDate;
    const paymentRemarks = formValue.feeDetails?.paymentRemarks;
    
    if (initialPayment && initialPayment > 0) {
      const paymentHistory: Payment[] = formValue.feeDetails?.paymentHistory || [];
      paymentHistory.push({
        amount: initialPayment,
        paymentDate: paymentDate || new Date(),
        remarks: paymentRemarks || 'Initial payment',
      });
      
      formValue.feeDetails.paymentHistory = paymentHistory;
      formValue.feeDetails.paidAmount = calculateTotalPaid(paymentHistory);
      formValue.feeDetails.pendingFees = calculatePendingFees(
        formValue.feeDetails.totalFees,
        formValue.feeDetails.paidAmount
      );
    }

    // Remove temporary fields
    if (formValue.feeDetails) {
      delete formValue.feeDetails.initialPayment;
      delete formValue.feeDetails.paymentDate;
      delete formValue.feeDetails.paymentRemarks;
    }

    return classroomId ? { ...formValue, classroomId } : formValue;
  }

  /**
   * Get payment history for display
   */
  getPaymentHistory(): Payment[] {
    return this.studentForm.get('feeDetails.paymentHistory')?.value || [];
  }

  /**
   * Build FormData payload for submission (supports optional image file)
   */
  private buildSubmitPayload(): FormData {
    const data = this.prepareFormData();
    const fd = new FormData();

    if (data.firstName) fd.append('firstName', data.firstName);
    if (data.lastName) fd.append('lastName', data.lastName);
    if (data.email) fd.append('email', data.email);
    if (data.contact) fd.append('contact', data.contact);
    if (data.gender) fd.append('gender', data.gender);
    if ((data as any).classroomId) fd.append('classroomId', (data as any).classroomId);
    if (data.academicDetails) fd.append('academicDetails', JSON.stringify(data.academicDetails));
    if (data.feeDetails) fd.append('feeDetails', JSON.stringify(data.feeDetails));

    const file = this.selectedFile();
    if (file) fd.append('image', file);

    return fd;
  }

  /**
   * Handle profile image file selection
   */
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    this.selectedFile.set(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = () => this.imagePreviewUrl.set(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      this.imagePreviewUrl.set(null);
    }
  }

  /**
   * Create new student
   */
  private createStudent(data: FormData): void {
    const firstName = this.studentForm.get('firstName')?.value ?? '';
    const lastName = this.studentForm.get('lastName')?.value ?? '';
    this.studentService.createStudent(data).subscribe({
      next: (response) => {
        this.submitting.set(false);
        const result = response.data;
        if (result) {
          const dialogRef = this.dialog.open(CredentialsDialogComponent, {
            data: {
              name: `${firstName} ${lastName}`,
              userId: result.userId,
              defaultPassword: result.defaultPassword,
              role: 'student',
            },
            disableClose: true,
          });
          dialogRef.afterClosed().subscribe(() => {
            this.notificationService.success('Student created successfully!');
            this.router.navigate(['/students', 'management', 'list']);
          });
        } else {
          this.notificationService.success('Student created successfully!');
          this.router.navigate(['/students', 'management', 'list']);
        }
      },
      error: (error: Error) => {
        this.notificationService.error(error.message || 'Failed to create student');
        this.submitting.set(false);
      },
    });
  }

  /**
   * Update existing student
   */
  private updateStudent(data: FormData): void {
    const id = this.studentId();
    if (!id) return;

    this.studentService.updateStudent(id, data).subscribe({
      next: (response) => {
        this.notificationService.success('Student updated successfully!');
        this.submitting.set(false);
        this.router.navigate(['/students', 'management', 'list']);
      },
      error: (error: Error) => {
        this.notificationService.error(error.message || 'Failed to update student');
        this.submitting.set(false);
      },
    });
  }

  hasAvailableClassroom(classValue: string | null | undefined): boolean {
    if (!classValue) return false;
    return this.classrooms().some(
      c => c.class === classValue && c.enrolledStudents.length < c.capacity
    );
  }

  addClassroom(): void {
    this.router.navigate(['/classrooms/management/add']);
  }

  /**
   * Cancel and navigate back
   */
  onCancel(): void {
    this.router.navigate(['/students', 'management', 'list']);
  }

  /**
   * Get error message for a form field
   */
  getErrorMessage(fieldName: string): string {
    const control = this.studentForm.get(fieldName);
    if (!control) return '';

    if (control.hasError('required')) return 'This field is required';
    if (control.hasError('email')) return 'Please enter a valid email';
    if (control.hasError('minlength')) return `Minimum length is ${control.errors?.['minlength'].requiredLength}`;
    if (control.hasError('maxlength')) return `Maximum length is ${control.errors?.['maxlength'].requiredLength}`;
    if (control.hasError('pattern')) return 'Invalid format';

    return '';
  }
}
