import { Component, OnInit, inject, signal, ChangeDetectionStrategy, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule, FormBuilder, FormArray, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { SharedMaterialModule } from '../../../../shared/shared-material.module';
import { FacultyService } from '../../../../shared/services/faculty.service';
import { ClassroomService } from '../../../../shared/services/classroom.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { CredentialsDialogComponent } from '../../../../shared/components/credentials-dialog/credentials-dialog.component';
import { Department, Speciality } from '../../models/faculty.model';
import { Classroom } from '../../../classroom/models/classroom.model';
import { environment } from '../../../../../environments/environment';

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
  private classroomService = inject(ClassroomService);
  private notificationService = inject(NotificationService);
  private dialog = inject(MatDialog);

  departmentOptions = Object.values(Department);
  specialityOptions = Object.values(Speciality);

  isEditMode = signal(false);
  editId = signal<string | null>(null);
  formLoading = signal(false);
  classrooms = signal<Classroom[]>([]);
  classroomLoading = signal(false);

  // Image upload signals
  selectedFile = signal<File | null>(null);
  imagePreviewUrl = signal<string | null>(null);
  existingImageUrl = signal<string | null>(null);

  /** True when yearsOfExperience > 0 — drives conditional past-exp requirement */
  hasExperience = signal(false);

  private destroyRef = inject(DestroyRef);

  facultyForm = this.fb.group({
    firstName: ['', [Validators.required, Validators.minLength(2)]],
    lastName: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    contact: ['', [Validators.required, Validators.pattern(/^(\+91[\-\s]?)?[0-9]{10}$/)]],
    department: ['', Validators.required],
    speciality: ['', Validators.required],
    degree: ['', Validators.required],
    yearsOfExperience: [null as number | null, [Validators.required, Validators.min(0)]],
    classroomId: [''],
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
    this.loadClassrooms();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.editId.set(id);
      this.loadFacultyForEdit(id);
    } else {
      this.facultyForm.get('classroomId')?.setValidators([Validators.required]);
      this.facultyForm.get('classroomId')?.updateValueAndValidity();
    }

    // Watch yearsOfExperience to toggle validators on past experience entries
    this.facultyForm.get('yearsOfExperience')!.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(val => {
        const hasExp = (val ?? 0) > 0;
        this.hasExperience.set(hasExp);
        this.reapplyPastExpValidators(hasExp);
      });
  }

  private loadClassrooms(): void {
    this.classroomLoading.set(true);
    this.classroomService.getAllClassrooms(1, 200).subscribe({
      next: (response) => {
        this.classrooms.set(response.data);
      },
      error: () => {
        this.notificationService.error('Failed to load classrooms. Please add a classroom first.');
      },
      complete: () => {
        this.classroomLoading.set(false);
      },
    });
  }

  hasAvailableClassrooms(): boolean {
    return this.classrooms().length > 0;
  }

  getClassroomLabel(classroom: Classroom): string {
    return `${classroom.class} ${classroom.section} - Room ${classroom.roomNumber}`;
  }

  addClassroom(): void {
    this.router.navigate(['/classrooms/management/add']);
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
        const hasExp = (f.yearsOfExperience ?? 0) > 0;
        this.hasExperience.set(hasExp);
        this.pastExperienceArray.clear();
        (f.pastExperience ?? []).forEach((exp) => {
          this.pastExperienceArray.push(this.fb.group({
            organization: [exp.organization, hasExp ? [Validators.required] : []],
            role: [exp.role, hasExp ? [Validators.required] : []],
            yearsOfExperience: [exp.yearsOfExperience, hasExp ? [Validators.required, Validators.min(0)] : [Validators.min(0)]],
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

        if (f.image) {
          this.existingImageUrl.set(
            environment.apiUrl.replace('/api', '') + f.image
          );
        }

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
    const hasExp = this.hasExperience();
    return this.fb.group({
      organization: ['', hasExp ? [Validators.required] : []],
      role: ['', hasExp ? [Validators.required] : []],
      yearsOfExperience: [null as number | null, hasExp ? [Validators.required, Validators.min(0)] : [Validators.min(0)]],
    });
  }

  private reapplyPastExpValidators(hasExp: boolean): void {
    this.pastExperienceArray.controls.forEach(ctrl => {
      const g = ctrl as FormGroup;
      g.get('organization')?.setValidators(hasExp ? [Validators.required] : []);
      g.get('role')?.setValidators(hasExp ? [Validators.required] : []);
      g.get('yearsOfExperience')?.setValidators(hasExp ? [Validators.required, Validators.min(0)] : [Validators.min(0)]);
      g.get('organization')?.updateValueAndValidity({ emitEvent: false });
      g.get('role')?.updateValueAndValidity({ emitEvent: false });
      g.get('yearsOfExperience')?.updateValueAndValidity({ emitEvent: false });
    });
  }

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

  private buildSubmitPayload(): FormData {
    const v = this.facultyForm.value;
    const fd = new FormData();

    if (v.firstName) fd.append('firstName', v.firstName);
    if (v.lastName) fd.append('lastName', v.lastName);
    if (v.email) fd.append('email', v.email);
    if (v.contact) fd.append('contact', v.contact);
    if (v.department) fd.append('department', v.department);
    if (v.speciality) fd.append('speciality', v.speciality);
    if (v.degree) fd.append('degree', v.degree);
    if (v.yearsOfExperience != null) fd.append('yearsOfExperience', String(v.yearsOfExperience));
    if (v.annualSalary != null) fd.append('annualSalary', String(v.annualSalary));
    if (v.classroomId) fd.append('classroomId', v.classroomId);
    fd.append('pastExperience', JSON.stringify(v.pastExperience ?? []));
    fd.append('salaryPayments', JSON.stringify(
      (v.salaryPayments ?? []).map((p: any) => ({
        ...p,
        date: p.date instanceof Date ? p.date.toISOString() : p.date,
      }))
    ));

    const file = this.selectedFile();
    if (file) fd.append('image', file);

    return fd;
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
    if (control.errors['pattern']) return 'Enter a valid 10 digit contact number.';
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

    const yearsOfExp = this.facultyForm.get('yearsOfExperience')?.value ?? 0;
    if (yearsOfExp > 0 && this.pastExperienceArray.length === 0) {
      this.notificationService.warning('Please add at least one past experience entry since total years of experience is greater than 0.');
      return;
    }

    const id = this.editId();
    const payload = this.buildSubmitPayload();

    if (this.isEditMode() && id) {
      this.facultyService.updateFaculty(id, payload).subscribe({
        next: () => {
          this.notificationService.success('Faculty member updated successfully.');
          this.router.navigate(['/faculty', id]);
        },
        error: (error: Error) => this.notificationService.error(error.message || 'Failed to update faculty member. Please try again.'),
      });
    } else {
      if (!this.hasAvailableClassrooms()) {
        this.notificationService.warning('No classrooms available. Please add a classroom first.');
        this.addClassroom();
        return;
      }

      if (!this.facultyForm.get('classroomId')?.value) {
        this.facultyForm.get('classroomId')?.markAsTouched();
        this.notificationService.warning('Please select a classroom before creating faculty.');
        return;
      }

      this.facultyService.createFaculty(payload).subscribe({
        next: (response) => {
          const result = response.data;
          if (result) {
            const dialogRef = this.dialog.open(CredentialsDialogComponent, {
              data: {
                name: `${this.facultyForm.value.firstName} ${this.facultyForm.value.lastName}`,
                userId: result.userId,
                defaultPassword: result.defaultPassword,
                role: 'faculty',
              },
              disableClose: true,
            });
            dialogRef.afterClosed().subscribe(() => {
              this.notificationService.success('Faculty member added successfully.');
              this.router.navigate(['/faculty']);
            });
          } else {
            this.notificationService.success('Faculty member added successfully.');
            this.router.navigate(['/faculty']);
          }
        },
        error: (error: Error) => this.notificationService.error(error.message || 'Failed to add faculty member. Please try again.'),
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
