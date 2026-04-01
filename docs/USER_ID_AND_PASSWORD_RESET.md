# Human-Readable User IDs & Password Reset — YPS Academy

> Implemented: April 2026

---

## Overview

Every student and faculty member is assigned a **human-readable login ID** (e.g. `YPSS26JOH001`) at the moment their record is created. This ID is stored on both the entity document and their `AuthUser` login account, replacing the previous approach of using MongoDB `_id` as the login identifier.

Admins can also **reset the password** of any student or faculty directly from the detail page, re-generating the default credentials without touching any other data.

---

## User ID Format

```
{PREFIX}{YY}{NAME3}{NNN}
```

| Part | Description | Example |
|------|-------------|---------|
| `PREFIX` | `YPSS` for students, `YPSF` for faculty | `YPSS` |
| `YY` | Last 2 digits of the current year | `26` |
| `NAME3` | First 3 uppercase letters of `firstName` (letters only, padded with `X` if short) | `JOH` |
| `NNN` | 3-digit sequence; increments per role + year | `001` |

### Examples

| Role | Name | Year | ID |
|------|------|------|----|
| Student | John Smith | 2026 | `YPSS26JOH001` |
| Student | John Doe (2nd John) | 2026 | `YPSS26JOH002` |
| Faculty | Ramesh Kumar | 2026 | `YPSF26RAM001` |
| Student | Li (short name) | 2026 | `YPSS26LIX001` |

> The sequence restarts each year — `YPSS27JOH001` is the first student named John in 2027.

---

## How the ID Is Generated

**File:** `backend/src/utils/generate-user-id.util.ts`

```
generateUserId(role: UserRole, firstName: string): Promise<string>
```

Steps:
1. Build `yearPrefix` = `YPSS26` (or `YPSF26`)
2. Query `AuthUser` for all existing IDs that start with `yearPrefix` and match `role`
3. Parse the last 3 digits of each — take the maximum
4. Return `yearPrefix + NAME3 + (max + 1).padStart(3, '0')`

The sequence is derived from `AuthUser` records, not a separate counter collection, so no extra migration or seed is needed.

---

## Where the ID Is Stored

| Location | Field | Notes |
|----------|-------|-------|
| `Student` document | `userId` | `unique: true, sparse: true` index |
| `Faculty` document | `userId` | `unique: true, sparse: true` index |
| `AuthUser` document | `userId` | Used for login; unique per role |

The `sparse` index means existing documents without a `userId` (created before this feature) are unaffected until they are re-created.

---

## Create Flow

```
Admin submits "Add Student" form
        │
        ▼
backend: generateUserId('student', firstName)  →  YPSS26JOH001
        │
        ▼
studentRepository.create({ ...dto, userId })
        │
        ▼
createAuthUser(userId, fullName, 'student')
  └─ AuthUser { userId: 'YPSS26JOH001', passwordHash, isFirstLogin: true }
        │
        ▼
Response: { student, userId, defaultPassword }
        │
        ▼
Frontend opens CredentialsDialogComponent
  └─ Shows Login ID + Default Password with copy buttons
```

---

## Password Reset Flow

Admins can reset a student or faculty password from the detail page. The button is **hidden from faculty and student roles** using `@if (roleService.isAdmin())`.

```
Admin clicks "Reset Password"
        │
        ▼
ConfirmDialogComponent — "Are you sure?"
        │
        ▼
POST /api/auth/reset-password  { entityId: userId, role }
        │
        ▼
resetAuthUser(userId, role)
  └─ Finds AuthUser by { userId, role }
  └─ Sets passwordHash = bcrypt(YPS@123)
  └─ Sets isFirstLogin = true
        │
        ▼
Response: { userId, defaultPassword: 'YPS@123' }
        │
        ▼
Frontend opens CredentialsDialogComponent
  └─ Admin shares new credentials with the user
        │
        ▼
User logs in → forced to change password (isFirstLogin: true)
```

---

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/auth/reset-password` | Admin only | Reset password to default; sets `isFirstLogin: true` |

**Request body:**
```json
{ "entityId": "YPSS26JOH001", "role": "student" }
```

**Response:**
```json
{ "success": true, "data": { "userId": "YPSS26JOH001", "defaultPassword": "YPS@123" } }
```

---

## Backend Files Changed / Added

| File | Change |
|------|--------|
| `src/utils/generate-user-id.util.ts` | **New** — `generateUserId(role, firstName)` function |
| `src/models/student.model.ts` | Added `userId?: string` to `IStudent` + schema (`unique, sparse`) |
| `src/models/faculty.model.ts` | Added `userId?: string` to `IFaculty` + schema (`unique, sparse`) |
| `src/utils/auth-user.util.ts` | `createAuthUser` now accepts pre-generated `userId` instead of `entityId` |
| `src/modules/student/student.service.ts` | `create()` calls `generateUserId` first; `delete()` uses `deleted.userId` |
| `src/modules/faculty/faculty.service.ts` | Same changes as student service |
| `src/modules/student/student.repository.ts` | `findByUserId()` now uses `findOne({ userId })` instead of `findById()` |

---

## Frontend Files Changed / Added

| File | Change |
|------|--------|
| `shared/models/student.model.ts` | Added `userId?: string` to `Student` interface |
| `features/faculty/models/faculty.model.ts` | Added `userId?: string` to `Faculty` interface |
| `shared/services/faculty.service.ts` | `createFaculty()` return type updated to `{ faculty, userId, defaultPassword }` |
| `features/faculty/components/faculty-form/` | Wired `CredentialsDialogComponent` after successful create |
| `features/student/components/student-detail/` | Injected `AuthService`, `RoleService`; added `onResetPassword()` |
| `features/faculty/components/faculty-detail/` | Same as student detail |
| `student-detail.component.html` | Reset Password + Delete wrapped in `@if (roleService.isAdmin())` |
| `faculty-detail.component.html` | Same |

---

## Adding a New Role in Future

If a third entity type (e.g. `parent`) is added, extend `generate-user-id.util.ts`:

```typescript
const prefix = role === 'student' ? 'YPSS'
             : role === 'faculty' ? 'YPSF'
             : 'YPSP'; // parent
```

No schema changes to `AuthUser` are needed — `userId` and `role` already support any string/enum value.
