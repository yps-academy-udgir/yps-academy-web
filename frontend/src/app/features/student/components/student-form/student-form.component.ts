/**
 * Student Form Component
 * Used for both creating and editing students
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
import { Student } from '../../../../shared/models/student.model';

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

  // Departments and states for dropdowns
  departments = ['Computer Science', 'Engineering', 'Business', 'Medicine', 'Arts', 'Science'];
  states = ['Active', 'Graduated'];
  
  ngOnInit(): void {
    this.initializeForm();
    this.checkEditMode();
  }

  /**
   * Initialize the reactive form
   */
  private initializeForm(): void {
    this.studentForm = this.fb.group({
      enrollmentNumber: ['', [Validators.required, Validators.pattern(/^[A-Z0-9]{6,10}$/)]],
      firstName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      lastName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^\+?[\d\s-]{10,15}$/)]],
      dateOfBirth: ['', Validators.required],
      address: this.fb.group({
        street: ['', Validators.required],
        city: ['', Validators.required],
        state: ['', Validators.required],
        zipCode: ['', [Validators.required, Validators.pattern(/^\d{5,6}$/)]],
        country: ['', Validators.required],
      }),
      academicDetails: this.fb.group({
        department: ['', Validators.required],
        semester: ['', [Validators.required, Validators.min(1), Validators.max(12)]],
        gpa: ['', [Validators.required, Validators.min(0), Validators.max(10)]],
        enrollmentDate: ['', Validators.required],
      }),
      status: ['active', Validators.required],
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
      enrollmentNumber: student.enrollmentNumber,
      firstName: student.firstName,
      lastName: student.lastName,
      email: student.email,
      phone: student.phone,
      dateOfBirth: student.dateOfBirth,
      address: student.address,
      academicDetails: {
        department: student.academicDetails.department,
        semester: student.academicDetails.semester,
        gpa: student.academicDetails.gpa,
        enrollmentDate: student.academicDetails.enrollmentDate,
      },
      status: student.status,
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
    if (control.hasError('min')) return `Minimum value is ${control.errors?.['min'].min}`;
    if (control.hasError('max')) return `Maximum value is ${control.errors?.['max'].max}`;

    return '';
  }
}
