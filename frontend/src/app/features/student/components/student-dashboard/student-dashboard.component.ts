/**
 * Student Dashboard Component
 * Main dashboard view for student information using Material Design
 * Displays student list in a data table with basic filtering
 * Uses Angular 20 features like Signals
 */

import { Component, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';

// Shared Material Module
import { SharedMaterialModule } from '../../../../shared/shared-material.module';

import { StudentService } from '../../../../shared/services/student.service';
import { Student } from '../../../../shared/models/student.model';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SharedMaterialModule,
  ],
  templateUrl: './student-dashboard.component.html',
  styleUrls: ['./student-dashboard.component.scss'],
})
export class StudentDashboardComponent implements OnInit, OnDestroy {
  /**
   * Angular Signals - Modern state management
   */
  students = signal<Student[]>([]);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);
  currentPage = signal<number>(0);
  pageSize = signal<number>(10);
  totalRecords = signal<number>(0);
  searchText = signal<string>('');

  // Computed signals
  filteredStudents = computed(() => {
    const search = this.searchText().toLowerCase();
    return this.students().filter(
      (student) =>
        student.firstName.toLowerCase().includes(search) ||
        student.lastName.toLowerCase().includes(search) ||
        student.email.toLowerCase().includes(search) ||
        student.phone.includes(search)
    );
  });

  // Table columns to display (First Name, Last Name, Email, Phone, DOB)
  displayedColumns: string[] = [
    'enrollmentNumber',
    'firstName',
    'lastName',
    'email',
    'phone',
    'dateOfBirth',
    'actions',
  ];

  private destroy$ = new Subject<void>();

  constructor(
    private studentService: StudentService,
    private router: Router
  ) {}

  /**
   * Component initialization
   * Load initial student data
   */
  ngOnInit(): void {
    this.loadStudents();
  }

  /**
   * Load students from service
   * Implements pagination
   */
  loadStudents(): void {
    this.loading.set(true);

    this.studentService
      .getAllStudents(this.currentPage() + 1, this.pageSize())
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.students.set(response.data);
          this.totalRecords.set(response.pagination.total);
          this.loading.set(false);
          this.error.set(null);
        },
        error: (err) => {
          this.error.set('Failed to load students. Please try again.');
          this.loading.set(false);
          console.error('Error loading students:', err);
        },
      });
  }

  /**
   * Handle pagination change
   * @param event - Pagination event from MatPaginator
   */
  onPageChange(event: PageEvent): void {
    this.currentPage.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.loadStudents();
  }

  /**
   * Format date for display
   * @param date - Date object
   * @returns Formatted date string
   */
  formatDate(date: any): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  /**
   * View student details
   * @param studentId - ID of student to view
   */
  viewStudent(studentId: string | undefined): void {
    if (studentId) {
      this.router.navigate(['/students', studentId]);
    }
  }

  /**
   * Edit student
   * @param studentId - ID of student to edit
   */
  editStudent(studentId: string | undefined): void {
    if (studentId) {
      this.router.navigate(['/students', studentId, 'edit']);
    }
  }

  /**
   * Delete student
   * @param studentId - ID of student to delete
   */
  deleteStudent(studentId: string | undefined): void {
    if (studentId && confirm('Are you sure you want to delete this student?')) {
      this.loading.set(true);

      this.studentService
        .deleteStudent(studentId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.loadStudents(); // Reload list
          },
          error: (err) => {
            this.error.set('Failed to delete student.');
            this.loading.set(false);
            console.error('Error deleting student:', err);
          },
        });
    }
  }

  /**
   * Clear search text
   */
  clearSearch(): void {
    this.searchText.set('');
  }

  /**
   * Navigate to create student page
   */
  createStudent(): void {
    this.router.navigate(['/students/create']);
  }

  /**
   * Cleanup on component destroy
   */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
