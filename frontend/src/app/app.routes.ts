import { Routes } from '@angular/router';
import { MainLayoutComponent } from './core/layout/main-layout/main-layout.component';
import { DashboardComponent } from './features/student/components/dashboard/dashboard.component';
import { StudentListComponent } from './features/student/components/student-list/student-list.component';
import { FACULTY_ROUTES } from './features/faculty/faculty.routes';
import { AUTH_ROUTES } from './features/auth/auth.routes';
import { authGuard } from './core/guards/auth.guard';

/**
 * Application Routes
 * Defines routing structure for the entire application
 * Uses main layout wrapper for consistent UI
 */
export const routes: Routes = [
  {
    path: 'auth',
    children: AUTH_ROUTES,
  },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        component: DashboardComponent,
        data: { title: 'Dashboard' },
      },
      {
        path: 'students',
        children: [
          {
            path: '',
            component: StudentListComponent,
            data: { title: 'Students List' },
          },
          {
            path: 'list',
            component: StudentListComponent,
            data: { title: 'Students List' },
          },
          {
            path: 'add',
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
          {
            path: ':id/marks',
            loadComponent: () =>
              import('./features/student/components/marks-entry/marks-entry.component').then(
                (m) => m.MarksEntryComponent
              ),
            data: { title: 'Enter Marks' },
          },
        ],
      },
      {
        path: 'faculty',
        children: FACULTY_ROUTES,
      },
    ],
  },
  // Public website (no admin layout)
  {
    path: 'website',
    loadChildren: () =>
      import('./features/website/website.routes').then((m) => m.WEBSITE_ROUTES),
  },
  // Wildcard route for 404
  {
    path: '**',
    redirectTo: 'auth/login',
  },
];
