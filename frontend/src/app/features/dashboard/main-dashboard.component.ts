/**
 * Main Dashboard Component
 * Central dashboard showing overview of all modules
 * Displays statistics for students, faculty, and future modules
 */

import { Component, OnInit, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatGridListModule } from '@angular/material/grid-list';
import { StudentService } from '../../shared/services/student.service';
import { FacultyService } from '../../shared/services/faculty.service';

interface ModuleCard {
  title: string;
  icon: string;
  color: string;
  bgColor: string;
  stats: ModuleStat[];
  route: string;
  description: string;
}

interface ModuleStat {
  label: string;
  value: number;
  icon?: string;
}

@Component({
  selector: 'app-main-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatGridListModule,
  ],
  templateUrl: './main-dashboard.component.html',
  styleUrls: ['./main-dashboard.component.scss'],
})
export class MainDashboardComponent implements OnInit {
  private router = inject(Router);
  private studentService = inject(StudentService);
  private facultyService = inject(FacultyService);

  // Access service signals
  students = this.studentService.students;
  faculty = this.facultyService.faculty;
  loading = computed(() => this.studentService.loading() || this.facultyService.loading());

  // Computed statistics
  totalStudents = computed(() => this.students().length);
  maleStudents = computed(() => 
    this.students().filter(s => s.gender === 'male').length
  );
  femaleStudents = computed(() => 
    this.students().filter(s => s.gender === 'female').length
  );
  totalFaculty = computed(() => this.faculty().length);

  // Module cards - extensible for future modules
  moduleCards = computed<ModuleCard[]>(() => [
    {
      title: 'Students',
      icon: 'people',
      color: '#3f51b5',
      bgColor: 'rgba(63, 81, 181, 0.1)',
      description: 'Manage student records, marks, and information',
      route: '/students',
      stats: [
        { label: 'Total Students', value: this.totalStudents(), icon: 'people' },
        { label: 'Male', value: this.maleStudents(), icon: 'man' },
        { label: 'Female', value: this.femaleStudents(), icon: 'woman' },
      ],
    },
    {
      title: 'Faculty',
      icon: 'school',
      color: '#4caf50',
      bgColor: 'rgba(76, 175, 80, 0.1)',
      description: 'Manage faculty members and their information',
      route: '/faculty',
      stats: [
        { label: 'Total Faculty', value: this.totalFaculty(), icon: 'school' },
      ],
    },
    // Future modules can be added here:
    // {
    //   title: 'Classrooms',
    //   icon: 'meeting_room',
    //   color: '#ff9800',
    //   bgColor: 'rgba(255, 152, 0, 0.1)',
    //   description: 'Manage classroom allocation and schedules',
    //   route: '/classrooms',
    //   stats: [
    //     { label: 'Total Classrooms', value: 0, icon: 'meeting_room' },
    //     { label: 'Occupied', value: 0, icon: 'event_seat' },
    //   ],
    // },
  ]);

  ngOnInit(): void {
    // Load data for all modules
    this.loadData();
  }

  loadData(): void {
    this.studentService.getAllStudents(1, 1000).subscribe();
    this.facultyService.getAllFaculty(1, 1000).subscribe();
  }

  refresh(): void {
    this.loadData();
  }

  navigateToModule(route: string): void {
    this.router.navigate([route]);
  }
}
