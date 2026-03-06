import { Routes } from '@angular/router';
import { StudentDashboardComponent } from './features/student/components/student-dashboard/student-dashboard.component';

/**
 * Application Routes
 * Defines routing structure for the entire application
 * 
 * Routes:
 * - / -> Student Dashboard (default)
 * - /students -> Student management module
 *   - /students (list/dashboard)
 *   - /students/create (create new student)
 *   - /students/:id (view student details)
 *   - /students/:id/edit (edit student)
 */
export const routes: Routes = [
  {
    path: '',
    redirectTo: '/students',
    pathMatch: 'full',
  },
  {
    path: 'students',
    children: [
      {
        path: '',
        component: StudentDashboardComponent,
        data: { title: 'Student Management Dashboard' },
      },
      // TODO: Add create, edit, and detail components as they are created
      // {
      //   path: 'create',
      //   component: StudentCreateComponent,
      //   data: { title: 'Create Student' },
      // },
      // {
      //   path: ':id',
      //   component: StudentDetailComponent,
      //   data: { title: 'Student Details' },
      // },
      // {
      //   path: ':id/edit',
      //   component: StudentEditComponent,
      //   data: { title: 'Edit Student' },
      // },
    ],
  },
  // Wildcard route for 404
  {
    path: '**',
    redirectTo: '/students',
  },
];
