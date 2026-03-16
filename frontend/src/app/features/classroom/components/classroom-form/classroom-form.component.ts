import { Component, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ClassroomService } from '../../../../shared/services/classroom.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { Class } from '../../models/classroom.model';

@Component({
  selector: 'app-classroom-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './classroom-form.component.html',
  styleUrls: ['./classroom-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClassroomFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private classroomService = inject(ClassroomService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private notification = inject(NotificationService);

  classroomForm!: FormGroup;
  isEditMode = false;
  classroomId: string | null = null;
  loading = this.classroomService.loading;

  classOptions = Object.values(Class);

  ngOnInit(): void {
    this.classroomId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.classroomId;

    this.classroomForm = this.fb.group({
      class: ['', Validators.required],
      section: ['', [Validators.required, Validators.pattern(/^[A-Z]$/i)]],
      roomNumber: ['', Validators.required],
      capacity: [30, [Validators.required, Validators.min(1)]],
      academicYear: ['', [Validators.required, Validators.pattern(/^\d{4}-\d{4}$/)]],
    });

    if (this.isEditMode && this.classroomId) {
      this.loadClassroom();
    }
  }

  loadClassroom(): void {
    this.classroomService.getClassroomById(this.classroomId!).subscribe({
      next: (response) => {
        this.classroomForm.patchValue(response.data);
      },
      error: () => {
        this.notification.error('Failed to load classroom');
        this.router.navigate(['/classrooms/management/list']);
      },
    });
  }

  onSubmit(): void {
    if (this.classroomForm.invalid) return;

    const formData = { ...this.classroomForm.value };
    formData.section = formData.section.toUpperCase();

    const request = this.isEditMode
      ? this.classroomService.updateClassroom(this.classroomId!, formData)
      : this.classroomService.createClassroom(formData);

    const action = this.isEditMode ? 'updated' : 'created';
    request.subscribe({
      next: (response) => {
        this.notification.success('Classroom ' + action + ' successfully');
        this.router.navigate(['/classrooms/management', response.data._id]);
      },
      error: (err) => {
        this.notification.error(err.error?.message || 'Failed to save classroom');
      },
    });
  }

  cancel(): void {
    this.router.navigate(['/classrooms/management/list']);
  }
}
