# Auth, RBAC & Student Portal — YPS Academy

> Implemented: April 2026

---

## Role Overview

| Role | Description |
|------|-------------|
| `admin` | Full access to everything |
| `faculty` | Manage students, classrooms, attendance, results. Read-only on faculty. No payments |
| `student` | Read-only access to own profile, marks, attendance |

---

## How AuthUsers Are Created

Every student and faculty created via the API automatically gets an `AuthUser` login account:

- **Login ID** = MongoDB `_id` of the Student/Faculty document
- **Default password** = `YPS@123`
- **`isFirstLogin`** = `true` — forces a password change on first login
- On **delete** of student/faculty → their `AuthUser` is also deleted

The create response includes `{ student/faculty, userId, defaultPassword }` so the admin can share credentials.

---

## Password Flows

| Flow | Endpoint | Who |
|------|----------|-----|
| First login | Auto-redirected to `/auth/change-password` | Student / Faculty |
| Change own password | `POST /api/auth/change-password` | Any logged-in user |
| Admin resets password | `POST /api/auth/reset-password` | Admin only |

After a successful password change, `isFirstLogin` is set to `false` and redirect goes to `/dashboard`.

---

## Permission Matrix

| Route | Admin | Faculty | Student |
|-------|:-----:|:-------:|:-------:|
| **Students** | | | |
| GET list, detail, stats | ✅ | ✅ | ❌ |
| GET own profile (`/me`) | ❌ | ❌ | ✅ |
| POST / PUT (create, edit) | ✅ | ✅ | ❌ |
| DELETE | ✅ | ❌ | ❌ |
| POST `/:id/payments` | ✅ | ❌ | ❌ |
| Fees summary / defaulters | ✅ | ❌ | ❌ |
| **Faculty** | | | |
| GET list, detail, stats | ✅ | ✅ | ❌ |
| POST / PUT / DELETE | ✅ | ❌ | ❌ |
| POST `/:id/payments` | ✅ | ❌ | ❌ |
| **Classrooms** | | | |
| GET list, detail, schedule | ✅ | ✅ | ✅ |
| POST / PUT / schedule update | ✅ | ✅ | ❌ |
| DELETE | ✅ | ❌ | ❌ |
| Assign / remove faculty | ✅ | ❌ | ❌ |
| Enroll / remove students | ✅ | ✅ | ❌ |
| **Attendance** | | | |
| GET (all views) | ✅ | ✅ | ✅ own |
| POST `/bulk` | ✅ | ✅ | ❌ |
| **Exam Results** | | | |
| GET (all views) | ✅ | ✅ | ✅ own |
| POST / PUT (create, bulk) | ✅ | ✅ | ❌ |
| DELETE | ✅ | ❌ | ❌ |

---

## Backend Files Changed / Added

| File | Change |
|------|--------|
| `src/models/auth.model.ts` | Added `isFirstLogin: boolean` field |
| `src/utils/auth-user.util.ts` | **New** — `createAuthUser`, `deleteAuthUser`, `resetAuthUser` helpers |
| `src/middleware/auth.middleware.ts` | Added `requireRoles(...roles)` factory; removed console.logs |
| `src/modules/auth/dto/auth.dto.ts` | Added `changePasswordSchema`, `resetPasswordSchema` |
| `src/modules/auth/auth.service.ts` | Added `changePassword`, `resetPassword`; `isFirstLogin` in login response |
| `src/modules/auth/auth.controller.ts` | Added `changePassword`, `resetPassword` handlers |
| `src/modules/auth/auth.routes.ts` | Added `POST /change-password`, `POST /reset-password` |
| `src/modules/student/student.service.ts` | `create()` auto-creates AuthUser; `delete()` removes AuthUser; added `getMe()` |
| `src/modules/student/student.repository.ts` | Added `findByUserId()` |
| `src/modules/student/student.controller.ts` | Added `getMe` handler |
| `src/modules/student/student.routes.ts` | Added `GET /me`; applied `requireRoles` to all routes |
| `src/modules/faculty/faculty.service.ts` | `create()` auto-creates AuthUser; `delete()` removes AuthUser |
| `src/modules/faculty/faculty.routes.ts` | Applied `requireRoles` to all routes |
| `src/modules/classroom/classroom.routes.ts` | Applied `requireRoles` to all routes |
| `src/modules/attendance/attendance.routes.ts` | Applied `requireRoles` to all routes |
| `src/modules/exam-result/exam-result.routes.ts` | Applied `requireRoles` to all routes |

---

## Frontend Files Changed / Added

| File | Change |
|------|--------|
| `features/auth/models/auth.model.ts` | Added `isFirstLogin` to `AuthUser` interface |
| `features/auth/services/auth.service.ts` | Added `changePassword()`, `resetPassword()`; removed console.logs |
| `features/auth/auth.routes.ts` | Added `/change-password` route |
| `features/auth/components/change-password/` | **New** — standalone form for changing password |
| `shared/services/role.service.ts` | **New** — `isAdmin`, `isFaculty`, `isStudent`, `isFirstLogin` computed signals |
| `core/guards/role.guard.ts` | **New** — `roleGuard('admin', 'faculty')` factory guard |
| `core/guards/first-login.guard.ts` | **New** — redirects to `/auth/change-password` if `isFirstLogin` |
| `shared/components/credentials-dialog/` | **New** — shows userId + defaultPassword with copy buttons |
| `app.routes.ts` | Added `firstLoginGuard` to `MainLayout` `canActivate` |

---

## Usage Patterns

### Protecting a route by role
```typescript
// In a routes file
{
  path: 'fee-management',
  canActivate: [authGuard, roleGuard('admin')],
  loadComponent: () => import('./fee.component').then(m => m.FeeComponent),
}
```

### Hiding a button by role in a template
```typescript
// In component
private roleService = inject(RoleService);
isAdmin = this.roleService.isAdmin;
```
```html
@if (isAdmin()) {
  <button mat-icon-button color="warn" (click)="delete()">
    <mat-icon>delete</mat-icon>
  </button>
}
```

### Showing credentials after create
```typescript
private dialog = inject(MatDialog);

onCreate(result: { faculty: Faculty; userId: string; defaultPassword: string }) {
  this.dialog.open(CredentialsDialogComponent, {
    data: { name: result.faculty.firstName, userId: result.userId, defaultPassword: result.defaultPassword, role: 'faculty' }
  });
}
```

### Backend requireRoles
```typescript
// In a routes file
router.delete('/:id', verifyToken, requireRoles('admin'), deleteHandler);
```
