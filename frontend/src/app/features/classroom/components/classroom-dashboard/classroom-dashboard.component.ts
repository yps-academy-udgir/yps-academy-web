import { Component, inject, OnInit, ChangeDetectionStrategy, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ClassroomService } from '../../../../shared/services/classroom.service';

@Component({
  selector: 'app-classroom-dashboard',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule],
  templateUrl: './classroom-dashboard.component.html',
  styleUrls: ['./classroom-dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClassroomDashboardComponent implements OnInit {
  private classroomService = inject(ClassroomService);
  private router = inject(Router);

  // Signals from service
  loading = this.classroomService.loading;
  error = this.classroomService.error;
  classrooms = this.classroomService.classrooms;

  // Computed stats
  totalClassrooms = computed(() => this.classrooms().length);
  totalCapacity = computed(() =>
    this.classrooms().reduce((sum, c) => sum + c.capacity, 0)
  );
  totalEnrolled = computed(() =>
    this.classrooms().reduce((sum, c) => sum + c.enrolledStudents.length, 0)
  );
  occupancyRate = computed(() => {
    const capacity = this.totalCapacity();
    const enrolled = this.totalEnrolled();
    return capacity > 0 ? Math.round((enrolled / capacity) * 100) : 0;
  });

  ngOnInit(): void {
    // Load all classrooms for stats
    this.classroomService.getAllClassrooms(1, 100).subscribe();
  }

  navigateToList(): void {
    this.router.navigate(['/classrooms/management/list']);
  }

  navigateToAdd(): void {
    this.router.navigate(['/classrooms/management/add']);
  }
}
