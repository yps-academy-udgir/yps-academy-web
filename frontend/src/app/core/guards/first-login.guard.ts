import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { RoleService } from '../../shared/services/role.service';

/**
 * Redirects to /auth/change-password when the user has not yet
 * changed their default password after first login.
 */
export const firstLoginGuard: CanActivateFn = (route) => {
  const roleService = inject(RoleService);
  const router = inject(Router);

  // Allow the change-password route itself through
  if (route.routeConfig?.path === 'change-password') return true;

  if (roleService.isFirstLogin()) {
    return router.createUrlTree(['/auth/change-password']);
  }

  return true;
};
