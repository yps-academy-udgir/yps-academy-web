/**
 * Student List Component
 * Displays student list in a table with filtering, search, and pagination
 * Uses Angular 20 features: Signals, @if/@for syntax, inject()
 */

import { Component, OnInit, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';

// Shared Material Module
import { SharedMaterialModule } from '../../../../shared/shared-material.module';
import { StudentService } from '../../../../shared/services/student.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { LoadingComponent } from '../../../../shared/components/loading/loading.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { ErrorMessageComponent } from '../../../../shared/components/error-message/error-message.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { Student, Class } from '../../../../shared/models/student.model';

@Component({
  selector: 'app-student-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SharedMaterialModule,
  ],
  templateUrl: './student-list.component.html',
  styleUrls: ['./student-list.component.scss'],
})
export class StudentListComponent implements OnInit {
  // Inject services using Angular's inject() function
  private router = inject(Router);
  private studentService = inject(StudentService);
  private notificationService = inject(NotificationService);
  private dialog = inject(MatDialog);

  // Signals for reactive state management
  searchText = signal<string>('');
  selectedClass = signal<string>('');
  currentPage = signal<number>(0);
  pageSize = signal<number>(10);

  // Class filter options derived from the Class enum
  classOptions = Object.values(Class).map((value) => ({ value, label: `Class ${value}` }));

  // Access service signals
  students = this.studentService.students;
  loading = this.studentService.loading;
  error = this.studentService.error;
  totalRecords = this.studentService.totalStudents;

  // Computed signals
  filteredStudents = computed(() => {
    const search = this.searchText().toLowerCase();
    const classFilter = this.selectedClass();

    return this.students().filter((student) => {
      const matchesSearch =
        !search ||
        student.firstName.toLowerCase().includes(search) ||
        student.lastName.toLowerCase().includes(search) ||
        student.email.toLowerCase().includes(search) ||
        student.contact.includes(search);

      const matchesClass =
        !classFilter ||
        student.academicDetails?.class === classFilter;

      return matchesSearch && matchesClass;
    });
  });

  hasStudents = computed(() => this.filteredStudents().length > 0);

  // Table columns to display
  displayedColumns: string[] = [
    'name',
    'email',
    'contact',
    'gender',
    'actions',
  ];

  constructor() {
    // Using effect for side effects based on signal changes
    effect(() => {
      if (this.error()) {
        this.notificationService.error(this.error()!);
      }
    });
  }

  /**
   * Component initialization
   */
  ngOnInit(): void {
    this.loadStudents();
  }

  /**
   * Load students from service
   */
  loadStudents(): void {
    this.studentService
      .getAllStudents(this.currentPage() + 1, this.pageSize())
      .subscribe();
  }

  /**
   * Handle pagination change
   */
  onPageChange(event: PageEvent): void {
    this.currentPage.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.loadStudents();
  }

  /**
   * View student details
   */
  viewStudent(student: Student): void {
    if (student._id) {
      this.router.navigate(['/students', student._id]);
    }
  }

  /**
   * Edit student
   */
  editStudent(student: Student): void {
    if (student._id) {
      this.router.navigate(['/students', student._id, 'edit']);
    }
  }

  /**
   * Delete student with confirmation
   */
  deleteStudent(student: Student): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete Student',
        message: `Are you sure you want to delete ${student.firstName} ${student.lastName}? This action cannot be undone.`,
        confirmText: 'Delete',
        cancelText: 'Cancel',
        confirmColor: 'warn',
      },
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed && student._id) {
        this.performDelete(student._id);
      }
    });
  }

  /**
   * Perform delete operation
   */
  private performDelete(id: string): void {
    this.studentService.deleteStudent(id).subscribe({
      next: () => {
        this.notificationService.success('Student deleted successfully');
      },
      error: () => {
        this.notificationService.error('Failed to delete student');
      },
    });
  }

  /**
   * Clear search text
   */
  clearSearch(): void {
    this.searchText.set('');
  }

  /**
   * Clear all filters (search + class)
   */
  clearFilters(): void {
    this.searchText.set('');
    this.selectedClass.set('');
  }

  /**
   * Navigate to create student page
   */
  createStudent(): void {
    this.router.navigate(['/students/add']);
  }

  /**
   * Get full name of student
   */
  getFullName(student: Student): string {
    return `${student.firstName} ${student.lastName}`;
  }
}
