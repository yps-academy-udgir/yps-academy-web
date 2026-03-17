import { Component, ChangeDetectionStrategy, Input, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTableModule } from '@angular/material/table';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FacultyAssignmentService } from '../../services/faculty-assignment.service';
import { FacultyService } from '../../../../shared/services/faculty.service';
import { Classroom, Subject, FacultyAssignment, FacultyInfo } from '../../models/classroom.model';
import { Faculty } from '../../../faculty/models/faculty.model';
import { NotificationService } from '../../../../core/services/notification.service';
import { MatCheckbox } from '@angular/material/checkbox'; 
import { ActivatedRoute, Router } from '@angular/router';
import { ClassroomService } from '../../../../shared/services/classroom.service';
@Component({
  selector: 'app-faculty-assignment',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatFormFieldModule,
    MatTableModule,
    ReactiveFormsModule,
    MatCheckbox,
  ],
  templateUrl: './faculty-assignment.component.html',
  styleUrls: ['./faculty-assignment.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FacultyAssignmentComponent implements OnInit {
  classroom!: Classroom;

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private classroomService = inject(ClassroomService);
  
  
  private facultyAssignmentService = inject(FacultyAssignmentService);
  private facultyService = inject(FacultyService);
  private notification = inject(NotificationService);
  private fb = inject(FormBuilder);

  facultyList = signal<Faculty[]>([]);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);
  classroomId = signal<string>('');

  assignmentForm: FormGroup = this.fb.group({
    facultyId: ['', Validators.required],
    subject: ['', Validators.required],
    isPrimary: [false],
  });

  subjects = Object.values(Subject);

  ngOnInit(): void {
    this.fetchFaculty();
    
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.notification.error('Classroom ID is missing');
      this.router.navigate(['/classrooms/management/list']);
      return;
    }

    this.classroomId.set(id);
    this.getClassroomDetails(id);
    
  }
  getClassroomDetails(id: string): void {
     this.loading.set(true);

    this.classroomService.getClassroomById(this.classroomId()).subscribe({
      next: (res) => {
       this.classroom = res.data;
       console.log(this.classroom);
       
        this.loading.set(false);
       },
      error: () => {
        this.loading.set(false);
        this.notification.error('Failed to load classroom details');
      },
    });   
    
   
  }

  fetchFaculty(): void {
    this.loading.set(true);
    this.facultyService.getAllFaculty(1, 100).subscribe({
      next: (res) => {
        this.facultyList.set(res.data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load faculty');
        this.loading.set(false);
      },
    });
  }

  assignFaculty(): void {
    if (!this.classroom?._id || this.assignmentForm.invalid) return;
    this.loading.set(true);
    this.facultyAssignmentService
      .assignFaculty(this.classroom._id, this.assignmentForm.value)
      .subscribe({
        next: (res) => {
          this.notification.success('Faculty assigned successfully');
          this.classroom.facultyAssignments = res.data.facultyAssignments;
          this.assignmentForm.reset({ isPrimary: false });
          this.loading.set(false);
        },
        error: (err) => {
          this.notification.error(err?.error?.message || 'Failed to assign faculty');
          this.loading.set(false);
        },
      });
  }

  removeAssignment(facultyId: string, subject: string): void {
    if (!this.classroom?._id) return;
    this.loading.set(true);
    this.facultyAssignmentService
      .removeFaculty(this.classroom._id, facultyId, subject)
      .subscribe({
        next: (res) => {
          this.notification.success('Faculty assignment removed');
          this.classroom.facultyAssignments = res.data.facultyAssignments;
          this.loading.set(false);
        },
        error: (err) => {
          this.notification.error(err?.error?.message || 'Failed to remove assignment');
          this.loading.set(false);
        },
      });
  }

  // Helpers to safely handle populated vs unpopulated facultyId
  getFacultyId(fa: any): string {
    if (!fa) return '';
    const fid = fa.facultyId;
    if (!fid) return '';
    if (typeof fid === 'string') return fid;
    return fid._id || fid.id || fid.toString() || '';
  }

  getFacultyDisplay(fa: any): string {
    const fid = fa?.facultyId;
    if (!fid) return '';
    if (typeof fid === 'string') return fid;
    const first = fid.firstName || '';
    const last = fid.lastName || '';
    const name = `${first} ${last}`.trim();
    return name || fid.email || fid._id || '';
  }
}
