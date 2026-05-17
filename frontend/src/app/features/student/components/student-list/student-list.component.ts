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
import { CredentialsDialogComponent } from '../../../../shared/components/credentials-dialog/credentials-dialog.component';
import { Student, Class, FilterState, StudentStatus } from '../../../../shared/models/student.model';
import { FilterBarComponent } from '../../../../shared/components/filter-bar/filter-bar.component';
import { RoleService } from '../../../../shared/services/role.service';
import { AuthService } from '../../../auth/services/auth.service';
import { NumericFormatPipe } from '../../../../shared/pipes/numeric-format.pipe';


@Component({
  selector: 'app-student-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SharedMaterialModule,
    FilterBarComponent,
    NumericFormatPipe
  ],
  templateUrl: './student-list.component.html',
  styleUrls: ['./student-list.component.scss'],
})
export class StudentListComponent implements OnInit {
  // Inject services using Angular's inject() function
  private router = inject(Router);
  private studentService = inject(StudentService);
  private notificationService = inject(NotificationService);
  private authService = inject(AuthService);
  private dialog = inject(MatDialog);
  roleService = inject(RoleService);

  // Signals for reactive state management
  searchText     = signal<string>('');
  selectedClass  = signal<string>('');
  selectedYear   = signal<string>('');
  selectedStatus = signal<string>('');
  currentPage    = signal<number>(0);
  pageSize       = signal<number>(10);

  // Filter option lists
  classOptions  = Object.values(Class).map((value) => ({ value, label: `Class ${value}` }));
  statusOptions = [
    { value: StudentStatus.ACTIVE,  label: 'Active' },
    { value: StudentStatus.ALUMNI,  label: 'Alumni' },
    { value: StudentStatus.DROPPED, label: 'Dropped' },
  ];

  yearOptions = computed(() => {
    const years = new Set(
      this.students()
        .map((s) => s.academicDetails?.yearOfAdmission)
        .filter((y): y is string => typeof y === 'string' && y.trim().length > 0)
    );
    return Array.from(years)
      .sort((a, b) => b.localeCompare(a))
      .map((y) => ({ value: y, label: y }));
  });

  // Access service signals
  students = this.studentService.students;
  loading = this.studentService.loading;
  error = this.studentService.error;
  totalRecords = this.studentService.totalStudents;

  // Computed signals
  filteredStudents = computed(() => {
    const search = this.searchText().toLowerCase();
    const classFilter = this.selectedClass();
    const yearFilter = this.selectedYear();

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

      const matchesYear =
        !yearFilter ||
        String(student.academicDetails?.yearOfAdmission) === yearFilter;

      const statusFilter = this.selectedStatus();
      const matchesStatus =
        !statusFilter ||
        (student.status ?? StudentStatus.ACTIVE) === statusFilter;

      return matchesSearch && matchesClass && matchesYear && matchesStatus;
    });
  });

  hasStudents = computed(() => this.filteredStudents().length > 0);

  // Slice of filteredStudents for the current page (client-side paging)
  pagedStudents = computed(() => {
    const start = this.currentPage() * this.pageSize();
    return this.filteredStudents().slice(start, start + this.pageSize());
  });

  // Table columns to display
  displayedColumns: string[] = [
    'rollNumber',
    'name',
    'class',
    'status',
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
    // Fetch all students at once so client-side filtering + pagination are consistent.
    // status='all' bypasses the backend active-only default.
    this.studentService
      .getAllStudents(1, 10000, undefined, 'all')
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
      this.router.navigate(['/students', 'management', student._id]);
    }
  }

  /**
   * Edit student
   */
  editStudent(student: Student): void {
    if (student._id) {
      this.router.navigate(['/students', 'management', student._id, 'edit']);
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

  onFilterChange(state: FilterState): void {
    this.searchText.set(state.search);
    this.selectedClass.set(state.selectedClass);
    this.selectedYear.set(state.selectedYear);
    this.selectedStatus.set(state.selectedStatus ?? '');
    this.currentPage.set(0); // reset to first page on any filter change
  }

  /**
   * Clear all filters
   */
  clearFilters(): void {
    this.searchText.set('');
    this.selectedClass.set('');
    this.selectedYear.set('');
    this.selectedStatus.set('');
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

  enterMarks(student: Student): void {
    if (student._id) {
      this.router.navigate(['/students', student._id, 'marks']);
    }
  }

  viewFeeReceipt(student: Student): void {
    if (student._id) {
      this.router.navigate(['/students', 'fees', student._id, 'receipt']);
    }
  }

  resetPassword(student: Student): void {
    if (!student.userId) {
      this.notificationService.error('No login account found for this student.');
      return;
    }
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Reset Password',
        message: `Reset the password for ${student.firstName} ${student.lastName}? They will be prompted to change it on next login.`,
        confirmText: 'Reset',
        cancelText: 'Cancel',
      },
    });
    ref.afterClosed().subscribe((confirmed) => {
      if (!confirmed) return;
      this.authService.resetPassword(student.userId!, 'student').subscribe({
        next: (result) => {
          this.dialog.open(CredentialsDialogComponent, {
            data: { name: `${student.firstName} ${student.lastName}`, userId: result.userId, defaultPassword: result.defaultPassword, role: 'student' },
            disableClose: true,
          });
        },
        error: () => this.notificationService.error('Failed to reset password.'),
      });
    });
  }

  markDropped(student: Student): void {
    if (!student._id) return;
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Mark as Dropped',
        message: `Mark ${student.firstName} ${student.lastName} as dropped? They will be excluded from attendance and marks entry.`,
        confirmText: 'Mark Dropped',
        cancelText: 'Cancel',
        confirmColor: 'warn',
      },
    });
    ref.afterClosed().subscribe((confirmed) => {
      if (confirmed && student._id) {
        this.studentService.updateStudentStatus(student._id, 'dropped').subscribe({
          next: () => this.notificationService.success('Student marked as dropped'),
          error: () => this.notificationService.error('Failed to update status'),
        });
      }
    });
  }

  reinstateStudent(student: Student): void {
    if (!student._id) return;
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Reinstate Student',
        message: `Reinstate ${student.firstName} ${student.lastName} as an active student?`,
        confirmText: 'Reinstate',
        cancelText: 'Cancel',
        confirmColor: 'primary',
      },
    });
    ref.afterClosed().subscribe((confirmed) => {
      if (confirmed && student._id) {
        this.studentService.updateStudentStatus(student._id, 'active').subscribe({
          next: () => this.notificationService.success('Student reinstated successfully'),
          error: () => this.notificationService.error('Failed to update status'),
        });
      }
    });
  }
}
