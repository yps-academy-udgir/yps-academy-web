import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormArray, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SharedMaterialModule } from '../../../../shared/shared-material.module';
import { FacultyService } from '../../../../shared/services/faculty.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { Department, Speciality } from '../../models/faculty.model';

@Component({
  selector: 'app-faculty-form',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule, SharedMaterialModule],
  templateUrl: './faculty-form.component.html',
  styleUrls: ['./faculty-form.component.scss'],
})
export class FacultyFormComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private facultyService = inject(FacultyService);
  private notificationService = inject(NotificationService);

  departmentOptions = Object.values(Department);
  specialityOptions = Object.values(Speciality);

  facultyForm = this.fb.group({
    firstName: ['', [Validators.required, Validators.minLength(2)]],
    lastName: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    contact: ['', [Validators.required, Validators.pattern(/^\+?[\d\s\-().]{7,20}$/)]],
    department: ['', Validators.required],
    speciality: ['', Validators.required],
    degree: ['', Validators.required],
    yearsOfExperience: [null as number | null, [Validators.required, Validators.min(0)]],
    pastExperience: this.fb.array([]),
    annualSalary: [null as number | null, [Validators.required, Validators.min(1)]],
    salaryPayments: this.fb.array([]),
  });

  get loading() {
    return this.facultyService.loading;
  }

  get pastExperienceArray(): FormArray {
    return this.facultyForm.get('pastExperience') as FormArray;
  }

  get salaryPaymentsArray(): FormArray {
    return this.facultyForm.get('salaryPayments') as FormArray;
  }

  pastExperienceGroup(): FormGroup {
    return this.fb.group({
      organization: ['', Validators.required],
      role: ['', Validators.required],
      yearsOfExperience: [null as number | null, [Validators.required, Validators.min(0)]],
    });
  }

  salaryPaymentGroup(): FormGroup {
    return this.fb.group({
      date: ['', Validators.required],
      amount: [null as number | null, [Validators.required, Validators.min(1)]],
      note: [''],
    });
  }

  addPastExperience(): void {
    this.pastExperienceArray.push(this.pastExperienceGroup());
  }

  removePastExperience(index: number): void {
    this.pastExperienceArray.removeAt(index);
  }

  addPayment(): void {
    this.salaryPaymentsArray.push(this.salaryPaymentGroup());
  }

  removePayment(index: number): void {
    this.salaryPaymentsArray.removeAt(index);
  }

  getControl(group: AbstractControl, name: string) {
    return (group as FormGroup).get(name);
  }

  getErrorMessage(controlName: string): string {
    const control = this.facultyForm.get(controlName);
    return this.resolveError(control);
  }

  getNestedError(group: AbstractControl, name: string): string {
    return this.resolveError((group as FormGroup).get(name));
  }

  private resolveError(control: AbstractControl | null): string {
    if (!control?.errors) return '';
    if (control.errors['required']) return 'This field is required.';
    if (control.errors['minlength']) return `Minimum ${control.errors['minlength'].requiredLength} characters required.`;
    if (control.errors['email']) return 'Enter a valid email address.';
    if (control.errors['pattern']) return 'Enter a valid contact number.';
    if (control.errors['min']) return 'Value must be 0 or greater.';
    return 'Invalid value.';
  }

  paidTotal(): number {
    return this.salaryPaymentsArray.controls.reduce((sum, g) => {
      const v = (g as FormGroup).get('amount')?.value;
      return sum + (v ? +v : 0);
    }, 0);
  }

  remainingBalance(): number {
    const annual = this.facultyForm.get('annualSalary')?.value ?? 0;
    return +annual - this.paidTotal();
  }

  onSubmit(): void {
    if (this.facultyForm.invalid) {
      this.facultyForm.markAllAsTouched();
      return;
    }
    this.facultyService.createFaculty(this.facultyForm.value as any).subscribe({
      next: () => {
        this.notificationService.success('Faculty member added successfully.');
        this.router.navigate(['/faculty']);
      },
      error: () => {
        this.notificationService.error('Failed to add faculty member. Please try again.');
      },
    });
  }

  onCancel(): void {
    this.router.navigate(['/faculty']);
  }
}
