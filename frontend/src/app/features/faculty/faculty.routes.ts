import { Routes } from '@angular/router';

export const FACULTY_ROUTES: Routes = [
  // Default route - redirect to dashboard
  {
    path: '',
    loadComponent: () =>
      import('./components/faculty-dashboard/faculty-dashboard.component').then((m) => m.FacultyDashboardComponent),
    data: { title: 'Faculty Dashboard' },
  },

  // Management group - faculty CRUD operations
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
    path: ':id/payment-receipt',
    loadComponent: () =>
      import('./components/faculty-payment-receipt-page/faculty-payment-receipt-page.component').then((m) => m.FacultyPaymentReceiptPageComponent),
    data: { title: 'Faculty Payment Receipt' },
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./components/faculty-detail/faculty-detail.component').then((m) => m.FacultyDetailComponent),
    data: { title: 'Faculty Details' },
  },

  // Future feature placeholders (lazy-loaded modules)
  // Uncomment and implement when ready
  // {
  //   path: 'reports',
  //   loadChildren: () => import('./modules/reports/reports.routes').then((m) => m.FACULTY_REPORTS_ROUTES),
  // },
  // {
  //   path: 'attendance',
  //   loadChildren: () => import('./modules/attendance/attendance.routes').then((m) => m.FACULTY_ATTENDANCE_ROUTES),
  // },
  // {
  //   path: 'schedule',
  //   loadChildren: () => import('./modules/schedule/schedule.routes').then((m) => m.FACULTY_SCHEDULE_ROUTES),
  // },
  // {
  //   path: 'documents',
  //   loadChildren: () => import('./modules/documents/documents.routes').then((m) => m.FACULTY_DOCUMENTS_ROUTES),
  // },
];
