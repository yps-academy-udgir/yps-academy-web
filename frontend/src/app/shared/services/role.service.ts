import { Injectable, inject, computed } from '@angular/core';
import { AuthService } from '../../features/auth/services/auth.service';
import { UserRole } from '../../features/auth/models/auth.model';

/**
 * Provides role-based helper signals consumed by components and guards.
 * Single source of truth — never check role strings directly in templates.
 */
@Injectable({ providedIn: 'root' })
export class RoleService {
  private auth = inject(AuthService);

  role = computed(() => this.auth.currentUser()?.role ?? null);
  isAdmin = computed(() => this.role() === UserRole.ADMIN);
  isFaculty = computed(() => this.role() === UserRole.FACULTY);
  isStudent = computed(() => this.role() === UserRole.STUDENT);
  isFirstLogin = computed(() => this.auth.currentUser()?.isFirstLogin ?? false);

  hasAnyRole(...roles: UserRole[]): boolean {
    const current = this.role();
    return current !== null && roles.includes(current);
  }
}
