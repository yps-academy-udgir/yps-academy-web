import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SharedMaterialModule } from '../../../shared/shared-material.module';
import { SubjectConfigService } from '../../../shared/services/subject-config.service';
import { NotificationService } from '../../../core/services/notification.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

// Class values matching backend enum
const ALL_CLASSES = ['5th', '6th', '7th', '8th', '9th', '10th'];

@Component({
  selector: 'app-subject-config',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SharedMaterialModule],
  templateUrl: './subject-config.component.html',
  styleUrls: ['./subject-config.component.scss'],
})
export class SubjectConfigComponent implements OnInit {
  private dialog = inject(MatDialog);
  private fb = inject(FormBuilder);
  subjectConfigService = inject(SubjectConfigService);
  private notificationService = inject(NotificationService);

  form!: FormGroup;
  saving = signal(false);
  allClasses = ALL_CLASSES;

  get classSubjectsArray(): FormArray {
    return this.form.get('classSubjects') as FormArray;
  }

  subjectsArrayForClass(classIndex: number): FormArray {
    return this.classSubjectsArray.at(classIndex).get('subjects') as FormArray;
  }

  ngOnInit(): void {
    // Build form skeleton with all 6 classes
    this.form = this.fb.group({
      classSubjects: this.fb.array(ALL_CLASSES.map((cls) => this.newClassRow(cls, []))),
      selfStudyFee: [0, [Validators.required, Validators.min(0)]],
    });

    this.subjectConfigService.get().subscribe({
      next: () => this.populateForm(),
    });
  }

  private populateForm(): void {
    const config = this.subjectConfigService.subjectConfig();
    if (!config) return;

    this.form.patchValue({ selfStudyFee: config.selfStudyFee ?? 0 });
    this.classSubjectsArray.clear();

    const classSubjects = config.classSubjects ?? [];
    for (const cls of ALL_CLASSES) {
      const existing = classSubjects.find((c) => c.className === cls);
      this.classSubjectsArray.push(this.newClassRow(cls, existing?.subjects ?? []));
    }
  }

  private newClassRow(className: string, subjects: Array<{ name: string; fee: number; isActive: boolean }>): FormGroup {
    return this.fb.group({
      className: [className],
      subjects: this.fb.array(subjects.map((s) => this.newSubjectRow(s.name, s.fee, s.isActive))),
    });
  }

  private newSubjectRow(name = '', fee = 0, isActive = true): FormGroup {
    return this.fb.group({
      name: [name, [Validators.required, Validators.maxLength(100)]],
      fee: [fee, [Validators.required, Validators.min(0)]],
      isActive: [isActive],
    });
  }

  addSubject(classIndex: number): void {
    this.subjectsArrayForClass(classIndex).push(this.newSubjectRow());
  }

  removeSubject(classIndex: number, subjectIndex: number): void {
    const subjectName = this.subjectsArrayForClass(classIndex)
      .at(subjectIndex)
      .get('name')?.value;

     const ref = this.dialog.open(ConfirmDialogComponent, {
          data: {
          title: 'Delete Subject',
          message: `Are You Sure You Want To Delete ${subjectName} Subject?`,
          confirmText: 'Delete',
            cancelText: 'Cancel',
            confirmColor: 'warn',
          },
        });
      ref.afterClosed().subscribe((res : boolean) =>{
        if(res){this.subjectsArrayForClass(classIndex).removeAt(subjectIndex)};
      })
    }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.subjectConfigService.update(this.form.value).subscribe({
      next: () => {
        this.notificationService.success('Subject configuration saved successfully');
        this.saving.set(false);
      },
      error: () => {
        this.notificationService.error('Failed to save subject configuration');
        this.saving.set(false);
      },
    });
  }
}
