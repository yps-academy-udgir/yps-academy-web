import { Routes } from '@angular/router';
import { MainLayoutComponent } from './core/layout/main-layout/main-layout.component';
import { StudentDashboardComponent } from './features/student/components/student-dashboard/student-dashboard.component';

/**
 * Application Routes
 * Defines routing structure for the entire application
 * Uses main layout wrapper for consistent UI
 */
export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: '',
        redirectTo: 'students',
        pathMatch: 'full',
      },
      {
        path: 'students',
        children: [
          {
            path: '',
            component: StudentDashboardComponent,
            data: { title: 'Student Management' },
          },
          {
            path: 'create',
            loadComponent: () =>
              import('./features/student/components/student-form/student-form.component').then(
                (m) => m.StudentFormComponent
              ),
            data: { title: 'Add New Student' },
          },
          {
            path: ':id/edit',
            loadComponent: () =>
              import('./features/student/components/student-form/student-form.component').then(
                (m) => m.StudentFormComponent
              ),
            data: { title: 'Edit Student' },
          },
          {
            path: ':id',
            loadComponent: () =>
              import('./features/student/components/student-detail/student-detail.component').then(
                (m) => m.StudentDetailComponent
              ),
            data: { title: 'Student Details' },
          },
        ],
      },
    ],
  },
  // Wildcard route for 404
  {
    path: '**',
    redirectTo: 'students',
  },
];
