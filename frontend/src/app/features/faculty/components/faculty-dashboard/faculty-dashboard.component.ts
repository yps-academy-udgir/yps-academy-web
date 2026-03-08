import { Component, OnInit, inject, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FacultyService } from '../../../../shared/services/faculty.service';

interface StatCard {
  title: string;
  value: number;
  icon: string;
  color: string;
  bgColor: string;
}
@Component({
  selector: 'app-faculty-dashboard',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './faculty-dashboard.component.html',
  styleUrls: ['./faculty-dashboard.component.scss'],
})
export class FacultyDashboardComponent implements OnInit {
  private router = inject(Router);
  private facultyService = inject(FacultyService);

  faculty = this.facultyService.faculty;
  loading = this.facultyService.loading;
  totalFaculty = computed(() => this.faculty().length);

  statCards = computed<StatCard[]>(() => [
    { title: 'Total Faculty', value: this.totalFaculty(), icon: 'school', color: '#3f51b5', bgColor: 'rgba(63,81,181,0.1)' },
  ]);

  ngOnInit(): void {
    this.facultyService.getAllFaculty(1, 1000).subscribe();
  }

  refresh(): void {
    this.facultyService.getAllFaculty(1, 1000).subscribe();
  }

  navigateToAddFaculty(): void {
    this.router.navigate(['/faculty/add']);
  }

  navigateToFacultyList(): void {
    this.router.navigate(['/faculty/list']);
  }
}
