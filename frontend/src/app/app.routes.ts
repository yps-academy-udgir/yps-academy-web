import { Routes } from '@angular/router';
import { MainLayoutComponent } from './core/layout/main-layout/main-layout.component';
import { MainDashboardComponent } from './features/dashboard/main-dashboard.component';
import { STUDENT_ROUTES } from './features/student/student.routes';
import { FACULTY_ROUTES } from './features/faculty/faculty.routes';
import { CLASSROOM_ROUTES } from './features/classroom/classroom.routes';
import { RESULTS_ROUTES } from './features/results/results.routes';
import { AUTH_ROUTES } from './features/auth/auth.routes';
import { authGuard } from './core/guards/auth.guard';
import { firstLoginGuard } from './core/guards/first-login.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'website',
    pathMatch: 'full',
  },
  {
    path: 'auth',
    children: AUTH_ROUTES,
  },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard, firstLoginGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'my-profile',
        loadComponent: () =>
          import('./features/student/components/my-profile/my-profile.component').then(
            (m) => m.MyProfileComponent
          ),
        data: { title: 'My Profile' },
      },
      {
        path: 'my-fees',
        loadComponent: () =>
          import('./features/student/components/my-fees/my-fees.component').then(
            (m) => m.MyFeesComponent
          ),
        data: { title: 'My Fees' },
      },
      {
        path: 'my-marks',
        loadComponent: () =>
          import('./features/student/components/my-marks/my-marks.component').then(
            (m) => m.MyMarksComponent
          ),
        data: { title: 'My Marks' },
      },
      {
        path: 'dashboard',
        component: MainDashboardComponent,
        data: { title: 'Main Dashboard' },
      },
      {
        path: 'students',
        children: STUDENT_ROUTES,
      },
      {
        path: 'faculty',
        children: FACULTY_ROUTES,
      },
      {
        path: 'classrooms',
        children: CLASSROOM_ROUTES,
      },
      {
        path: 'results',
        children: RESULTS_ROUTES,
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
    redirectTo: 'website',
  },
];
