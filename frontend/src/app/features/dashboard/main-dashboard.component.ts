/**
 * Main Dashboard Component
 * Central dashboard showing overview of all modules
 * Displays statistics for students, faculty, and future modules
 */

import { Component, OnInit, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { StudentService } from '../../shared/services/student.service';
import { FacultyService } from '../../shared/services/faculty.service';
import { ClassroomService } from '../../shared/services/classroom.service';

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
    MatExpansionModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatDividerModule,
  ],
  templateUrl: './main-dashboard.component.html',
  styleUrls: ['./main-dashboard.component.scss'],
})
export class MainDashboardComponent implements OnInit {
  private router = inject(Router);
  private studentService = inject(StudentService);
  private facultyService = inject(FacultyService);
  private classroomService = inject(ClassroomService);

  // Access service signals
  students = this.studentService.students;
  faculty = this.facultyService.faculty;
  classrooms = this.classroomService.classrooms;
  loading = computed(() => 
    this.studentService.loading() || 
    this.facultyService.loading() || 
    this.classroomService.loading()
  );

  // Computed statistics
  totalStudents = computed(() => this.students().length);
  maleStudents = computed(() =>
    this.students().filter(s => s.gender === 'male').length
  );
  femaleStudents = computed(() =>
    this.students().filter(s => s.gender === 'female').length
  );
  totalFaculty = computed(() => this.faculty().length);
  totalClassrooms = computed(() => this.classrooms().length);
  totalCapacity = computed(() =>
    this.classrooms().reduce((sum, c) => sum + c.capacity, 0)
  );
  totalEnrolled = computed(() =>
    this.classrooms().reduce((sum, c) => sum + c.enrolledStudents.length, 0)
  );
  uniqueDepartments = computed(() =>
    new Set(this.faculty().map(f => f.department)).size
  );
  avgExperience = computed(() => {
    const f = this.faculty();
    if (!f.length) return 0;
    return Math.round(f.reduce((sum, m) => sum + (m.yearsOfExperience || 0), 0) / f.length);
  });

  // Module cards - extensible for future modules
  moduleCards = computed<ModuleCard[]>(() => [
    {
      title: 'Students',
      icon: 'people',
      color: '#3f51b5',
      bgColor: 'rgba(63, 81, 181, 0.1)',
      description: 'Manage student records, marks, and information',
      route: '/students/management/list',
      stats: [
        { label: 'Total Students', value: this.totalStudents(), icon: 'people' },
        { label: 'Male', value: this.maleStudents(), icon: 'man' },
        { label: 'Female', value: this.femaleStudents(), icon: 'woman' },
      ],
    },
    {
      title: 'Faculty',
      icon: 'school',
      color: '#9c27b0',
      bgColor: 'rgba(156, 39, 176, 0.1)',
      description: 'Manage faculty members and department assignments',
      route: '/faculty/list',
      stats: [
        { label: 'Total Faculty', value: this.totalFaculty(), icon: 'school' },
        { label: 'Departments', value: this.uniqueDepartments(), icon: 'business' },
        { label: 'Avg. Experience (yrs)', value: this.avgExperience(), icon: 'workspace_premium' },
      ],
    },
    {
      title: 'Classrooms',
      icon: 'meeting_room',
      color: '#ff9800',
      bgColor: 'rgba(255, 152, 0, 0.1)',
      description: 'Manage classroom allocation and schedules',
      route: '/classrooms/dashboard',
      stats: [
        { label: 'Total Classrooms', value: this.totalClassrooms(), icon: 'meeting_room' },
        { label: 'Total Capacity', value: this.totalCapacity(), icon: 'event_seat' },
        { label: 'Enrolled Students', value: this.totalEnrolled(), icon: 'people' },
      ],
    },
  ]);

  ngOnInit(): void {
    // Load data for all modules
    this.loadData();
  }

  loadData(): void {
    this.studentService.getAllStudents(1, 1000).subscribe();
    this.facultyService.getAllFaculty(1, 1000).subscribe();
    this.classroomService.getAllClassrooms(1, 1000).subscribe();
  }

  refresh(): void {
    this.loadData();
  }

  navigateToModule(route: string): void {
    this.router.navigate([route]);
  }
}
