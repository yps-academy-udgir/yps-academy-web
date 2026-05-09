import { Component, inject, OnInit, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { ClassroomService } from '../../../../shared/services/classroom.service';
import { Classroom, Class, getOccupancyPercentage, getOccupancyColor } from '../../models/classroom.model';
import { NotificationService } from '../../../../core/services/notification.service';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';


@Component({
  selector: 'app-classroom-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatFormFieldModule,
    MatDialogModule,
    MatPaginatorModule,
    MatMenuModule,
    MatTooltipModule,
  ],
  templateUrl: './classroom-list.component.html',
  styleUrls: ['./classroom-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClassroomListComponent implements OnInit {
  private classroomService = inject(ClassroomService);
  private router = inject(Router);
  private dialog = inject(MatDialog);
  private notification = inject(NotificationService);

  // Signals
  classrooms = this.classroomService.classrooms;
  loading = this.classroomService.loading;
  error = this.classroomService.error;
  totalClassrooms = this.classroomService.totalClassrooms;

  // Filter controls
  searchControl = new FormControl('');
  classFilterControl = new FormControl('');
  sectionFilterControl = new FormControl('');
  yearFilterControl = new FormControl('');

  // Filtered data
  filteredClassrooms = signal<Classroom[]>([]);

  // Pagination
  pageSize = 10;
  currentPage = 0;

  // Table columns
  displayedColumns = ['class', 'section', 'room', 'capacity', 'enrolled', 'occupancy', 'faculty', 'year', 'actions'];

  // Class options for filter
  classOptions = Object.values(Class);

  ngOnInit(): void {
    this.loadClassrooms();

    // Setup search filtering
    this.searchControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(() => this.loadClassrooms());

    this.classFilterControl.valueChanges.subscribe(() => this.loadClassrooms());
    this.sectionFilterControl.valueChanges.subscribe(() => this.loadClassrooms());
    this.yearFilterControl.valueChanges.subscribe(() => this.loadClassrooms());
  }

  loadClassrooms(): void {
    const search = this.searchControl.value || undefined;
    const classFilter = this.classFilterControl.value || undefined;
    const section = this.sectionFilterControl.value || undefined;
    const year = this.yearFilterControl.value || undefined;

    this.classroomService
      .getAllClassrooms(this.currentPage + 1, this.pageSize, classFilter, section, year, search)
      .subscribe();
  }

  onPageChange(event: PageEvent): void {
    this.pageSize = event.pageSize;
    this.currentPage = event.pageIndex;
    this.loadClassrooms();
  }

  getOccupancy(classroom: Classroom): number {
    return getOccupancyPercentage(classroom.enrolledStudents.length, classroom.capacity);
  }

  getOccupancyColorClass(occupancy: number): string {
    return getOccupancyColor(occupancy);
  }

  viewClassroom(id: string): void {
    this.router.navigate(['/classrooms/management', id]);
  }

  editClassroom(id: string): void {
    this.router.navigate(['/classrooms/management', id, 'edit']);
  }

  deleteClassroom(classroom: Classroom): void {
    let MatDialog= this.dialog.open(ConfirmDialogComponent,{
      data:{
        title:"Delete classroom",
        message: `are you sure you want to delete ${classroom.class}`,
        confirmText: 'Delete',
        cancelText: 'Cancel',
        confirmColor: 'warn',
      }
    })
    MatDialog.afterClosed().subscribe((confirmed)=>{
      if(confirmed && classroom._id){
         this.classroomService.deleteClassroom(classroom._id!).subscribe({
        next: () => {
          this.notification.success('Classroom deleted successfully');
          this.loadClassrooms();
        },
        error: (err) => {
          this.notification.error(err.error?.message || 'Failed to delete classroom');
        },
      });
      }
    })
  }

  assignFaculty(id: string): void {
    this.router.navigate(['/classrooms/faculty', id, 'assign']);
  }

  enrollStudents(id: string): void {
    this.router.navigate(['/classrooms/students', id, 'enroll']);
  }

  viewSchedule(id: string): void {
    this.router.navigate(['/classrooms', id, 'schedule']);
  }

  addClassroom(): void {
    this.router.navigate(['/classrooms/management/add']);
  }

  clearFilters(): void {
    this.searchControl.setValue('');
    this.classFilterControl.setValue('');
    this.sectionFilterControl.setValue('');
    this.yearFilterControl.setValue('');
  }
}
