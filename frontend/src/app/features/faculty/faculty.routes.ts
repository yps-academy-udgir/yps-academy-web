import { Routes } from '@angular/router';

export const FACULTY_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/faculty-dashboard/faculty-dashboard.component').then((m) => m.FacultyDashboardComponent),
    data: { title: 'Faculty Dashboard' },
  },
  {
    path: 'list',
    loadComponent: () =>
      import('./components/faculty-list/faculty-list.component').then((m) => m.FacultyListComponent),
    data: { title: 'Faculty List' },
  },
  {
    path: 'add',
    loadComponent: () =>
      import('./components/faculty-form/faculty-form.component').then((m) => m.FacultyFormComponent),
    data: { title: 'Add Faculty' },
  },
  {
    path: ':id/edit',
    loadComponent: () =>
      import('./components/faculty-form/faculty-form.component').then((m) => m.FacultyFormComponent),
    data: { title: 'Edit Faculty' },
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./components/faculty-detail/faculty-detail.component').then((m) => m.FacultyDetailComponent),
    data: { title: 'Faculty Details' },
  },
];
