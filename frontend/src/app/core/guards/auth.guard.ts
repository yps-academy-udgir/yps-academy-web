import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../features/auth/services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const isLoggedIn = authService.isLoggedIn();
  const currentUser = authService.currentUser();
  const token = authService.getToken();

  console.log('[AuthGuard] Checking access to:', state.url);
  console.log('[AuthGuard] isLoggedIn:', isLoggedIn);
  console.log('[AuthGuard] User:', currentUser?.userId || 'None');
  console.log('[AuthGuard] Token:', token ? 'Present' : 'Missing');

  if (isLoggedIn && token) {
    console.log('[AuthGuard] Access granted');
    return true;
  }

  console.warn('[AuthGuard] Access denied, redirecting to login');
  return router.createUrlTree(['/auth/login'], { queryParams: { returnUrl: state.url } });
};

