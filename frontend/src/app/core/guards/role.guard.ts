import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { RoleService } from '../../shared/services/role.service';
import { UserRole } from '../../features/auth/models/auth.model';

/**
 * Factory guard — restricts a route to the given roles.
 * Usage in route config: canActivate: [roleGuard('admin', 'faculty')]
 */
export const roleGuard = (...allowedRoles: UserRole[]): CanActivateFn =>
  () => {
    const roleService = inject(RoleService);
    const router = inject(Router);

    if (roleService.hasAnyRole(...allowedRoles)) return true;

    // Student goes to their portal, others go to dashboard
    const fallback = roleService.isStudent() ? '/student-portal' : '/dashboard';
    return router.createUrlTree([fallback]);
  };
