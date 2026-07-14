import { Component, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ClassroomService } from '../../../../shared/services/classroom.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { RoleService } from '../../../../shared/services/role.service';
import { getOccupancyPercentage, getOccupancyColor } from '../../models/classroom.model';
import { ClassroomChatComponent } from '../classroom-chat/classroom-chat.component';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-classroom-detail',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatTabsModule, MatTooltipModule, ClassroomChatComponent],
  templateUrl: './classroom-detail.component.html',
  styleUrls: ['./classroom-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClassroomDetailComponent implements OnInit {
  private classroomService = inject(ClassroomService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private notification = inject(NotificationService);
  private roleService = inject(RoleService);
  private dialog = inject(MatDialog);

  classroom = this.classroomService.selectedClassroom;
  loading = this.classroomService.loading;
  classroomId = '';
  selectedTabIndex = 0;

  get isStudentUser(): boolean {
    return this.roleService.isStudent();
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    const tab = this.route.snapshot.queryParamMap.get('tab');
    this.selectedTabIndex = tab === 'chat' ? (this.isStudentUser ? 0 : 4) : 0;

    if (id) {
      this.classroomId = id;
      this.classroomService.getClassroomById(id).subscribe();
    }
  }

  getOccupancy(): number {
    const c = this.classroom();
    if (!c) return 0;
    return getOccupancyPercentage(c.enrolledStudents.length, c.capacity);
  }

  getOccupancyClass(): string {
    return getOccupancyColor(this.getOccupancy());
  }

  getFacultyName(faculty: any): string {
    if (typeof faculty === 'object' && faculty !== null) {
      return [faculty.firstName, faculty.lastName].filter(Boolean).join(' ') || 'Unknown';
    }
    return 'Unknown';
  }

  getStudentName(student: any): string {
    if (typeof student === 'object' && student !== null) {
      return [student.firstName, student.lastName].filter(Boolean).join(' ') || 'Unknown';
    }
    return 'Unknown';
  }

  getStudentEmail(student: any): string {
    return typeof student === 'object' && student !== null ? student.email : '';
  }

  getStudentRollNumber(student: any): string {
    return typeof student === 'object' && student !== null ? (student.rollNumber || '-') : '-';
  }

  getFacultyUserId(faculty: any): string {
    return typeof faculty === 'object' && faculty !== null ? (faculty.userId || '-') : '-';
  }

  getStudentUserId(student: any): string {
    return typeof student === 'object' && student !== null ? (student.userId || '-') : '-';
  }

  edit(): void {
    this.router.navigate(['/classrooms/management', this.classroom()?._id, 'edit']);
  }

  delete(): void {
    const name = this.classroom()?.roomNumber ?? 'this classroom';
    if (confirm('Delete ' + name + '? This action cannot be undone.')) {
      this.classroomService.deleteClassroom(this.classroom()!._id!).subscribe({
        next: () => {
          this.notification.success('Classroom deleted');
          this.router.navigate(['/classrooms/management/list']);
        },
        error: () => this.notification.error('Failed to delete classroom'),
      });
    }
  }

  assignFaculty(): void {
    this.router.navigate(['/classrooms/faculty', this.classroom()?._id, 'assign']);
  }

  enrollStudents(): void {
    this.router.navigate(['/classrooms/students', this.classroom()?._id, 'enroll']);
  }

  editSchedule(): void {
    this.router.navigate(['/classrooms', this.classroom()?._id, 'schedule']);
  }

  removeFaculty(fa:any): void {
    const facultyName = this.getFacultyName(fa.facultyId);

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data:{
        title:'Remove Faculty',
        message:`Are you sure you want to remove ${facultyName}?`,
        confirmText: 'Remove',
        confirmColor:'warn'
      },
    });
    dialogRef.afterClosed().subscribe(result => {
    if (result) {
           const facultyId = typeof fa.facultyId === 'object' ? fa.facultyId._id : fa.facultyId;
        this.classroomService.removeFaculty(this.classroom()!._id!, facultyId, fa.subject).subscribe({
        next: () => this.notification.success('Faculty removed'),
        error: () => this.notification.error('Failed to remove faculty'),
      });
    }
  });
  }

  removeStudent(student: any): void {
    const name = this.getStudentName(student);
    if (confirm('Remove ' + name + ' from this classroom?')) {
      const studentId = typeof student === 'object' ? student._id : student;
      this.classroomService.removeStudent(this.classroom()!._id!, studentId).subscribe({
        next: () => this.notification.success('Student removed'),
        error: () => this.notification.error('Failed to remove student'),
      });
    }
  }
}
