import { Routes } from '@angular/router';
import { guestGuard } from '../../core/guards/guest.guard';

export const AUTH_ROUTES: Routes = [
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./components/login/login.component').then((m) => m.LoginComponent),
    data: { title: 'Sign In' },
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
];

