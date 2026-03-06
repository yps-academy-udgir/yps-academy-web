/**
 * Student Form Component
 * Simplified form for creating and editing students
 * Uses Angular Reactive Forms with Material Design
 * Follows Angular 20 patterns with signals
 */
import { Component, OnInit, inject, signal, computed, effect } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';

import { SharedMaterialModule } from '../../../../shared/shared-material.module';
import { StudentService } from '../../../../shared/services/student.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { LoadingComponent } from '../../../../shared/components/loading/loading.component';
import { Student, Gender, Class, Subject, Payment } from '../../../../shared/models/student.model';
import { calculateFees, calculatePendingFees, calculateTotalPaid } from '../../../../shared/utils/fee-calculator.util';

@Component({
  selector: 'app-student-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SharedMaterialModule,
    LoadingComponent,
  ],
  templateUrl: './student-form.component.html',
  styleUrls: ['./student-form.component.scss'],
})
export class StudentFormComponent implements OnInit {
  // Inject services using Angular's inject() function
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private studentService = inject(StudentService);
  private notificationService = inject(NotificationService);

  // Signals for reactive state
  studentId = signal<string | null>(null);
  loading = signal<boolean>(false);
  submitting = signal<boolean>(false);

  // Computed signals
  isEditMode = computed(() => this.studentId() !== null);
  pageTitle = computed(() => this.isEditMode() ? 'Edit Student' : 'Add New Student');
  submitButtonText = computed(() => this.isEditMode() ? 'Update Student' : 'Create Student');

  // Fee-related signals
  calculatedFees = signal<number>(0);
  paidAmount = signal<number>(0);
  pendingFees = computed(() => calculatePendingFees(this.calculatedFees(), this.paidAmount()));

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

  // Subject options (predefined)
  availableSubjects = [
    Subject.MATHEMATICS,
    Subject.SCIENCE,
    Subject.ENGLISH,
  ];

  // Current year for year of admission
  currentYear = new Date().getFullYear();
  yearRange = Array.from({ length: 20 }, (_, i) => this.currentYear - i + 1);
  
  ngOnInit(): void {
    this.initializeForm();
    this.checkEditMode();
    this.setupFeeCalculation();
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
        yearOfAdmission: [''],
        class: [''],
        subjects: [[]],
        selfStudyMode: [false],
      }),
      feeDetails: this.fb.group({
        totalFees: [{ value: 0, disabled: true }],
        paidAmount: [0],
        pendingFees: [{ value: 0, disabled: true }],
        feeBreakdown: this.fb.group({
          baseFeePerSubject: [0],
          numberOfSubjects: [0],
          subjectsFee: [0],
          selfStudyFee: [0],
        }),
        paymentHistory: [[]],
        initialPayment: [0, [Validators.min(0)]], // For adding first payment
        paymentDate: [new Date()],
        paymentRemarks: [''],
      }),
    });
  }

  /**
   * Setup fee calculation reactivity
   */
  private setupFeeCalculation(): void {
    // Watch for changes in class, subjects, or selfStudyMode
    this.studentForm.get('academicDetails')?.valueChanges.subscribe((academicDetails) => {
      this.recalculateFees();
    });
  }

  /**
   * Recalculate fees based on class, subjects, and self-study mode
   */
  private recalculateFees(): void {
    const academicDetails = this.studentForm.get('academicDetails')?.value;
    const studentClass = academicDetails?.class;
    const subjects = academicDetails?.subjects || [];
    const selfStudyMode = academicDetails?.selfStudyMode || false;

    const feeCalculation = calculateFees(studentClass, subjects, selfStudyMode);

    // Update fee breakdown
    this.studentForm.get('feeDetails.feeBreakdown')?.patchValue({
      baseFeePerSubject: feeCalculation.baseFeePerSubject,
      numberOfSubjects: feeCalculation.numberOfSubjects,
      subjectsFee: feeCalculation.subjectsFee,
      selfStudyFee: feeCalculation.selfStudyFee,
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
        this.router.navigate(['/students']);
      },
    });
  }

  /**
   * Patch form with student data
   */
  private patchFormValues(student: Student): void {
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

    this.submitting.set(true);
    const formValue = this.prepareFormData();

    if (this.isEditMode()) {
      this.updateStudent(formValue);
    } else {
      this.createStudent(formValue);
    }
  }

  /**
   * Prepare form data before submission
   */
  private prepareFormData(): Partial<Student> {
    const formValue = this.studentForm.getRawValue(); // Use getRawValue to include disabled fields
    
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

    return formValue;
  }

  /**
   * Get payment history for display
   */
  getPaymentHistory(): Payment[] {
    return this.studentForm.get('feeDetails.paymentHistory')?.value || [];
  }

  /**
   * Create new student
   */
  private createStudent(data: Partial<Student>): void {
    this.studentService.createStudent(data).subscribe({
      next: (response) => {
        this.notificationService.success('Student created successfully!');
        this.submitting.set(false);
        this.router.navigate(['/students']);
      },
      error: (error) => {
        this.notificationService.error('Failed to create student');
        this.submitting.set(false);
      },
    });
  }

  /**
   * Update existing student
   */
  private updateStudent(data: Partial<Student>): void {
    const id = this.studentId();
    if (!id) return;

    this.studentService.updateStudent(id, data).subscribe({
      next: (response) => {
        this.notificationService.success('Student updated successfully!');
        this.submitting.set(false);
        this.router.navigate(['/students']);
      },
      error: (error) => {
        this.notificationService.error('Failed to update student');
        this.submitting.set(false);
      },
    });
  }

  /**
   * Cancel and navigate back
   */
  onCancel(): void {
    this.router.navigate(['/students']);
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
