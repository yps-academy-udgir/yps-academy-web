/**
 * Classroom Routes
 * Defines routing configuration for classroom feature
 */

import { Routes } from '@angular/router';

export const CLASSROOM_ROUTES: Routes = [
  // Default redirect to dashboard
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },

  // Dashboard
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./components/classroom-dashboard/classroom-dashboard.component').then(
        (m) => m.ClassroomDashboardComponent
      ),
    data: { title: 'Classroom Dashboard' },
  },

  // Management group (CRUD operations)
  {
    path: 'management',
    children: [
      {
        path: 'list',
        loadComponent: () =>
          import('./components/classroom-list/classroom-list.component').then(
            (m) => m.ClassroomListComponent
          ),
        data: { title: 'Classrooms List' },
      },
      {
        path: 'add',
        loadComponent: () =>
          import('./components/classroom-form/classroom-form.component').then(
            (m) => m.ClassroomFormComponent
          ),
        data: { title: 'Add Classroom' },
      },
      {
        path: ':id/edit',
        loadComponent: () =>
          import('./components/classroom-form/classroom-form.component').then(
            (m) => m.ClassroomFormComponent
          ),
        data: { title: 'Edit Classroom' },
      },
      {
        path: ':id',
        loadComponent: () =>
          import('./components/classroom-detail/classroom-detail.component').then(
            (m) => m.ClassroomDetailComponent
          ),
        data: { title: 'Classroom Details' },
      },
    ],
  },

  // Faculty assignment
  {
    path: 'faculty/:id/assign',
    loadComponent: () =>
      import('./components/faculty-assignment/faculty-assignment.component').then(
        (m) => m.FacultyAssignmentComponent
      ),
    data: { title: 'Assign Faculty' },
  },

  // Student enrollment
  {
    path: 'students/:id/enroll',
    loadComponent: () =>
      import('./components/student-enrollment/student-enrollment.component').then(
        (m) => m.StudentEnrollmentComponent
      ),
    data: { title: 'Enroll Students' },
  },

  // Schedule management
  {
    path: ':id/schedule',
    loadComponent: () =>
      import('./components/schedule-editor/schedule-editor.component').then(
        (m) => m.ScheduleEditorComponent
      ),
    data: { title: 'Edit Schedule' },
  },

  // Attendance
  {
    path: 'attendance/mark',
    loadComponent: () =>
      import('./components/mark-attendance/mark-attendance.component').then(
        (m) => m.MarkAttendanceComponent
      ),
    data: { title: 'Mark Attendance' },
  },
  {
    path: 'attendance/report',
    loadComponent: () =>
      import('./components/attendance-report/attendance-report.component').then(
        (m) => m.AttendanceReportComponent
      ),
    data: { title: 'Attendance Report' },
  },
];
