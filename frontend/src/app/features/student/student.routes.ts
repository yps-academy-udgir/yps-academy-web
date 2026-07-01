import { Routes } from '@angular/router';

export const STUDENT_ROUTES: Routes = [
  // Default route - redirect to dashboard
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },

  // Dashboard
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./components/dashboard/dashboard.component').then((m) => m.DashboardComponent),
    data: { title: 'Students Dashboard' },
  },

  // Management group - student CRUD operations
  {
    path: 'management',
    children: [
      {
        path: 'list',
        loadComponent: () =>
          import('./components/student-list/student-list.component').then((m) => m.StudentListComponent),
        data: { title: 'Students List' },
      },
      {
        path: 'add',
        loadComponent: () =>
          import('./components/student-form/student-form.component').then((m) => m.StudentFormComponent),
        data: { title: 'Add New Student' },
      },
      {
        path: ':id/edit',
        loadComponent: () =>
          import('./components/student-form/student-form.component').then((m) => m.StudentFormComponent),
        data: { title: 'Edit Student' },
      },
      {
        path: ':id',
        loadComponent: () =>
          import('./components/student-detail/student-detail.component').then((m) => m.StudentDetailComponent),
        data: { title: 'Student Details' },
      },
    ],
  },

  // Marks group - exam results and marks entry
  {
    path: 'marks',
    children: [
      {
        path: ':id/entry',
        loadComponent: () =>
          import('./components/marks-entry/marks-entry.component').then((m) => m.MarksEntryComponent),
        data: { title: 'Enter Marks' },
      },
    ],
  },

  //ID card - management
{
    path: 'idCards',
    children: [
      {
        path: ':id/idCard',
        loadComponent: () =>
          import('./components/id-card/id-card.component').then((m) => m.IdCardComponent),
        data: { title: 'IdCard' },
      },
    ],
  },
  // Fee management
  {
    path: 'fees',
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./components/fee-dashboard/fee-dashboard.component').then((m) => m.FeeDashboardComponent),
        data: { title: 'Fee Dashboard' },
      },
      {
        path: 'defaulters',
        loadComponent: () =>
          import('./components/fee-defaulters/fee-defaulters.component').then((m) => m.FeeDefaultersComponent),
        data: { title: 'Fee Defaulters' },
      },
      {
        path: ':id/receipt',
        loadComponent: () =>
          import('./components/fee-receipt-page/fee-receipt-page.component').then((m) => m.FeeReceiptPageComponent),
        data: { title: 'Fee Receipt' },
      },
    ],
  },
  {
    path: 'reports',
    children: [
      {
        path: ':studentId/:resultId',
        loadComponent: () =>
          import('./components/student-marks-report-page/student-marks-report-page.component').then((m) => m.StudentMarksReportPageComponent),
        data: { title: 'Student Marks Report' },
      },
    ],
  },

  // Future feature placeholders (lazy-loaded modules)
  // Uncomment and implement when ready
  // {
  //   path: 'reports',
  //   loadChildren: () => import('./modules/reports/reports.routes').then((m) => m.STUDENT_REPORTS_ROUTES),
  // },
  // {
  //   path: 'attendance',
  //   loadChildren: () => import('./modules/attendance/attendance.routes').then((m) => m.STUDENT_ATTENDANCE_ROUTES),
  // },
  // {
  //   path: 'documents',
  //   loadChildren: () => import('./modules/documents/documents.routes').then((m) => m.STUDENT_DOCUMENTS_ROUTES),
  // },
  // {
  //   path: 'schedule',
  //   loadChildren: () => import('./modules/schedule/schedule.routes').then((m) => m.STUDENT_SCHEDULE_ROUTES),
  // },

  // Legacy redirects for backward compatibility
  // TODO: Remove these after migration period
  {
    path: 'list',
    redirectTo: 'management/list',
    pathMatch: 'full',
  },
  {
    path: 'add',
    redirectTo: 'management/add',
    pathMatch: 'full',
  },
  {
    path: ':id/edit',
    redirectTo: 'management/:id/edit',
  },
  {
    path: ':id/marks',
    redirectTo: 'marks/:id/entry',
  },
  // Note: Direct :id route is ambiguous with redirects, handled by management/:id
];
