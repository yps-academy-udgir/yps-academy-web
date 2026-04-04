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
];
