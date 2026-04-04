import { Routes } from '@angular/router';
import { roleGuard } from '../../core/guards/role.guard';
import { UserRole } from '../../features/auth/models/auth.model';

export const SETTINGS_ROUTES: Routes = [
  {
    path: 'subjects',
    loadComponent: () =>
      import('./subject-config/subject-config.component').then((m) => m.SubjectConfigComponent),
    canActivate: [roleGuard(UserRole.ADMIN)],
    data: { title: 'Subject & Fee Config' },
  },
  {
    path: 'promote-year',
    loadComponent: () =>
      import('./promote-year/promote-year.component').then((m) => m.PromoteYearComponent),
    canActivate: [roleGuard(UserRole.ADMIN)],
    data: { title: 'Academic Year Promotion' },
  },
];
