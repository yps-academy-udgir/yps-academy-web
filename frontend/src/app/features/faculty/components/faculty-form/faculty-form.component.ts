import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormArray, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
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
export class FacultyFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private facultyService = inject(FacultyService);
  private notificationService = inject(NotificationService);

  departmentOptions = Object.values(Department);
  specialityOptions = Object.values(Speciality);

  isEditMode = signal(false);
  editId = signal<string | null>(null);
  formLoading = signal(false);

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

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.editId.set(id);
      this.loadFacultyForEdit(id);
    }
  }

  private loadFacultyForEdit(id: string): void {
    this.formLoading.set(true);
    this.facultyService.getFacultyById(id).subscribe({
      next: (res) => {
        const f = res.data;
        if (!f) { this.formLoading.set(false); return; }

        // Patch scalar fields
        this.facultyForm.patchValue({
          firstName: f.firstName,
          lastName: f.lastName,
          email: f.email,
          contact: f.contact,
          department: f.department,
          speciality: f.speciality,
          degree: f.degree,
          yearsOfExperience: f.yearsOfExperience,
          annualSalary: f.annualSalary,
        });

        // Rebuild pastExperience FormArray
        this.pastExperienceArray.clear();
        (f.pastExperience ?? []).forEach((exp) => {
          this.pastExperienceArray.push(this.fb.group({
            organization: [exp.organization, Validators.required],
            role: [exp.role, Validators.required],
            yearsOfExperience: [exp.yearsOfExperience, [Validators.required, Validators.min(0)]],
          }));
        });

        // Rebuild salaryPayments FormArray
        this.salaryPaymentsArray.clear();
        (f.salaryPayments ?? []).forEach((p) => {
          this.salaryPaymentsArray.push(this.fb.group({
            date: [p.date ? new Date(p.date) : '', Validators.required],
            amount: [p.amount, [Validators.required, Validators.min(1)]],
            note: [p.note ?? ''],
          }));
        });

        this.formLoading.set(false);
      },
      error: () => {
        this.notificationService.error('Failed to load faculty data for editing.');
        this.formLoading.set(false);
        this.router.navigate(['/faculty/list']);
      },
    });
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
    return this.resolveError(this.facultyForm.get(controlName));
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

    const id = this.editId();
    if (this.isEditMode() && id) {
      this.facultyService.updateFaculty(id, this.facultyForm.value as any).subscribe({
        next: () => {
          this.notificationService.success('Faculty member updated successfully.');
          this.router.navigate(['/faculty', id]);
        },
        error: () => this.notificationService.error('Failed to update faculty member. Please try again.'),
      });
    } else {
      this.facultyService.createFaculty(this.facultyForm.value as any).subscribe({
        next: () => {
          this.notificationService.success('Faculty member added successfully.');
          this.router.navigate(['/faculty']);
        },
        error: () => this.notificationService.error('Failed to add faculty member. Please try again.'),
      });
    }
  }

  onCancel(): void {
    const id = this.editId();
    if (this.isEditMode() && id) {
      this.router.navigate(['/faculty', id]);
    } else {
      this.router.navigate(['/faculty']);
    }
  }
}
