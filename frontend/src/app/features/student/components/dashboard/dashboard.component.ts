/**
 * Dashboard Component
 * Main dashboard view with student statistics
 * Displays summary cards and quick action buttons
 */

import { Component, OnInit, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { StudentService } from '../../../../shared/services/student.service';

interface StatCard {
  title: string;
  value: number;
  icon: string;
  color: string;
  bgColor: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  private router = inject(Router);
  private studentService = inject(StudentService);

  // Access service signals
  students = this.studentService.students;
  loading = this.studentService.loading;

  // Computed statistics
  totalStudents = computed(() => this.students().length);
  
  maleStudents = computed(() => 
    this.students().filter(s => s.gender === 'male').length
  );
  
  femaleStudents = computed(() => 
    this.students().filter(s => s.gender === 'female').length
  );

  // Statistics cards
  statCards = computed<StatCard[]>(() => [
    {
      title: 'Total Students',
      value: this.totalStudents(),
      icon: 'people',
      color: '#3f51b5',
      bgColor: 'rgba(63, 81, 181, 0.1)',
    },
    {
      title: 'Male Students',
      value: this.maleStudents(),
      icon: 'man',
      color: '#2196f3',
      bgColor: 'rgba(33, 150, 243, 0.1)',
    },
    {
      title: 'Female Students',
      value: this.femaleStudents(),
      icon: 'woman',
      color: '#e91e63',
      bgColor: 'rgba(233, 30, 99, 0.1)',
    },
  ]);

  ngOnInit(): void {
    this.loadStudents();
  }

  /**
   * Load students data
   */
  loadStudents(): void {
    this.studentService.getAllStudents(1, 1000).subscribe({
      next: (response) => {
        // Data is automatically set in the service
      },
      error: (error) => {
        console.error('Failed to load students:', error);
      },
    });
  }

  /**
   * Navigate to add student form
   */
  navigateToAddStudent(): void {
    this.router.navigate(['/students/add']);
  }

  /**
   * Navigate to student list
   */
  navigateToStudentList(): void {
    this.router.navigate(['/students']);
  }

  /**
   * Refresh dashboard data
   */
  refresh(): void {
    this.loadStudents();
  }
}
