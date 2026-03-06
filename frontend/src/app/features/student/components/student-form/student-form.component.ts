/**
 * Student Form Component
 * Simplified form for creating and editing students
 * Uses Angular Reactive Forms with Material Design
 * Follows Angular 20 patterns with signals
 */
import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';

import { SharedMaterialModule } from '../../../../shared/shared-material.module';
import { StudentService } from '../../../../shared/services/student.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { LoadingComponent } from '../../../../shared/components/loading/loading.component';
import { Student, Gender, Class, Subject } from '../../../../shared/models/student.model';

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

  // Form group
  studentForm!: FormGroup;

  // Gender options
  genderOptions = [
    { value: Gender.MALE, label: 'Male' },
    { value: Gender.FEMALE, label: 'Female' },
    { value: Gender.OTHER, label: 'Other' },
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
    });
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
    const formValue = this.studentForm.value;

    if (this.isEditMode()) {
      this.updateStudent(formValue);
    } else {
      this.createStudent(formValue);
    }
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
