# YPS Academy — Implementation Plan

> Reference doc for pending features and bug fixes. Last updated: **4 April 2026**.
> Use this doc before starting any of these tasks — each section has exact file paths, current state, and what to change.

---

## Status Legend
| Symbol | Meaning |
|--------|---------|
| ✅ | Completed |
| 🔄 | In Progress |
| ⬜ | Pending |

---

## Completed Work Log

| Date | Item | Files Changed |
|------|------|--------------|
| 4 Apr 2026 | **Chat UI — WhatsApp-style redesign** | `classroom-chat.component.ts`, `.html`, `.scss` |
| 4 Apr 2026 | **Chat bug fix — stale sender identity after login switch** | `socket.service.ts`, `chat.service.ts`, `classroom-chat.component.ts` |
| 4 Apr 2026 | **Student Form — classroom selection dropdown** | `student-form.component.ts`, `.html`, `.scss`, `student.dto.ts`, `student.service.ts` (BE) |

### Chat UI Redesign — What Was Done

- **Header bar** — Primary-coloured bar with group avatar, title, message count, refresh button.
- **Background** — Dot-pattern tinted surface (WhatsApp-style).
- **Bubbles** — Notched corners: received = flat top-left → white card; sent = flat top-right → primary-container tint.
- **Avatars** — Coloured initials circle for received messages (deterministic colour per sender name).
- **Sender label + role badge** — Shown only on received messages; role-coloured chips (student = indigo, faculty = purple, admin = red).
- **Timestamp** — `HH:MM` inside bubble bottom-right; full datetime on hover.
- **Read ticks** — Single grey tick = delivered; blue double tick = read (WhatsApp-style).
- **Date separators** — "Today / Yesterday / DD Month YYYY" pill when day changes.
- **Composer bar** — Pill-shaped input; attach icon left, auto-resize textarea middle, circular FAB send button right; **Enter** sends, **Shift+Enter** adds newline.
- **Attachment preview strip** — Left-primary-border accent, per-file remove button.

---

## Table of Contents

1. [Student Form — Classroom Selection Dropdown](#1-student-form--classroom-selection-dropdown)
2. [Faculty Form — Classroom Selection](#2-faculty-form--classroom-selection)
3. [Classroom List — Assign Student / Faculty](#3-classroom-list--assign-student--faculty)
4. [Subject Management with Per-Subject Fees](#4-subject-management-with-per-subject-fees)
5. [Chat Bug — Stale Sender Identity After Login Switch](#5-chat-bug--stale-sender-identity-after-login-switch)

---

## 1. ✅ Student Form — Classroom Selection Dropdown

### Current State
- Student add form is at `frontend/src/app/features/student/components/student-form/`
- When user picks a **class** (e.g., "5th"), the backend auto-assigns the student to the first available classroom for that class.
- Frontend calls `hasAvailableClassroom(classValue)` to check if any classroom exists for the selected class.
  - If classrooms **exist** → shows inline message: _"Will be auto-assigned to an available classroom"_
  - If **none exist** → shows a button: _"Add Classroom"_ → navigates to `/classrooms/management/add`
- Backend: `student.service.ts` calls `classroomRepository.findFirstAvailableByClass(classValue)` and throws `400` if none found.

### What Needs to Change
When there is more than one classroom available for the selected class, the user should see a **dropdown to choose which classroom** to enroll the student into (instead of purely auto-assigning).

#### Frontend Changes
**File:** `frontend/src/app/features/student/components/student-form/student-form.component.ts`

1. When `classControl.valueChanges` fires, filter `classrooms()` signal to get `availableClassrooms = classrooms.filter(c => c.class === selectedClass && c.enrolledStudents.length < c.capacity)`.
2. If `availableClassrooms.length === 1` → auto-select it (no dropdown, just show info message).
3. If `availableClassrooms.length > 1` → show a `<mat-select>` for classroom selection.
4. If `availableClassrooms.length === 0` → show the existing "Add Classroom" button (no change here).
5. Add `classroomId` to the form's `academicDetails` group as an optional control.
6. Pass `classroomId` in the submit payload only if explicitly selected.

**File:** `frontend/src/app/features/student/components/student-form/student-form.component.html`

Replace the static info hint block with a conditional block:
```html
@if (availableClassrooms().length === 0) {
  <!-- existing "no classroom" warning + button -->
} @else if (availableClassrooms().length === 1) {
  <!-- existing "will be auto-assigned" hint -->
} @else {
  <mat-form-field>
    <mat-label>Select Classroom</mat-label>
    <mat-select formControlName="classroomId">
      @for (room of availableClassrooms(); track room._id) {
        <mat-option [value]="room._id">
          {{ room.class }} - Section {{ room.section }} ({{ room.enrolledStudents.length }}/{{ room.capacity }} seats)
        </mat-option>
      }
    </mat-select>
  </mat-form-field>
}
```

#### Backend Changes
**File:** `backend/src/modules/student/student.service.ts`

Update `createStudent`:
- Accept optional `classroomId` in the DTO alongside `classValue`.
- If `classroomId` is provided → enroll directly into that classroom (validate it exists and has seats).
- If `classroomId` is **not** provided → existing auto-assign logic (`findFirstAvailableByClass`).

**File:** `backend/src/modules/student/dto/` — add `classroomId?: string` to create DTO.

#### Student Service (Frontend)
**File:** `frontend/src/app/features/student/services/student.service.ts`
- Include `classroomId` in the create request body when present.

### Notes
- The "no classroom" redirect button and the classroom list assign-from-classroom flow remain unchanged.
- Edit mode: classroom reassignment should continue to be done from the classroom's enroll-students page (not from the student edit form). No change needed there.

---

## 2. ✅ Faculty Form — Classroom Selection

### Current State
**Already implemented.** No changes needed.

- Faculty add form: `frontend/src/app/features/faculty/components/faculty-form/`
- In **add mode**, there is a required `<mat-select formControlName="classroomId">` that lists all classrooms.
- In **edit mode**, classroom reassignment is handled from the classroom's faculty-assignment page.
- This matches the desired behaviour.

### No Action Required
Keep as-is. Document here only for reference.

---

## 3. ✅ Classroom List — Assign Student / Faculty

### Current State
**Already implemented.** No changes needed.

- List component: `frontend/src/app/features/classroom/components/classroom-list/`
- Row action menu has:
  - **Assign Faculty** → navigates to `/classrooms/faculty/:id/assign`
  - **Enroll Students** → navigates to `/classrooms/students/:id/enroll`
- Empty state has an **"Add First Classroom"** button.
- Header always shows an **"Add Classroom"** button.

### No Action Required
Keep as-is.

---

## 4. ⬜ Subject Management with Per-Subject Fees

### Current State
#### Subjects
- Hardcoded enum in `frontend/src/app/shared/models/student.model.ts`:
  ```typescript
  export enum Subject { MATHEMATICS = 'Mathematics', SCIENCE = 'Science', ENGLISH = 'English' }
  ```
- Student form offers only these 3 subjects as a multi-select (`availableSubjects = [Subject.MATHEMATICS, Subject.SCIENCE, Subject.ENGLISH]`).

#### Fee Calculation (Hardcoded)
Both frontend and backend share the same hardcoded structure:

**Frontend:** `frontend/src/app/shared/utils/fee-calculator.util.ts`
**Backend:** `backend/src/utils/fee-calculator.util.ts`

```typescript
export const FEE_STRUCTURE: Record<Class, number> = {
  [Class.FIFTH]: 5000, [Class.SIXTH]: 5500, [Class.SEVENTH]: 6000,
  [Class.EIGHTH]: 6500, [Class.NINTH]: 7000, [Class.TENTH]: 7500,
};
export const SELF_STUDY_FEE = 8000;
// Total = baseFeePerSubject × numberOfSubjects + selfStudyFee
```

Fee is the same per subject regardless of which subject is chosen. No per-subject fee.

### What Needs to Change
Admin should be able to define subjects with individual fees. Fee calculation should use subject-specific fees.

#### New Data Model: SubjectConfig
A global config stored in the DB (single document, updatable by admin).

```typescript
interface SubjectConfig {
  _id: string;
  subjects: {
    name: string;       // e.g., "Mathematics"
    fee: number;        // e.g., 6000
    isActive: boolean;  // soft-delete to hide from dropdowns
  }[];
  selfStudyFee: number; // replaces hardcoded SELF_STUDY_FEE
  updatedAt: Date;
}
```

#### Backend Changes
**New file:** `backend/src/models/subject-config.model.ts` — Mongoose model for `SubjectConfig`.

**New module:** `backend/src/modules/subject-config/`
- `subject-config.model.ts` (or reuse above)
- `subject-config.repository.ts`
- `subject-config.service.ts`
- `subject-config.controller.ts`
- `subject-config.routes.ts`

**API Endpoints (admin-only):**
- `GET /api/subject-config` → returns current config (also accessible by faculty/student to show fees)
- `PUT /api/subject-config` → update subjects list + selfStudyFee (admin only)

**Fee calculator:** Update `fee-calculator.util.ts` to accept a `subjectFeeMap: Record<string, number>` parameter instead of reading from the hardcoded `FEE_STRUCTURE`. The route handler fetches `SubjectConfig` and passes the fee map in.

**Student service:** When creating/updating a student, fetch `SubjectConfig` to validate subjects and recalculate fees.

#### Frontend Changes

**New service:** `frontend/src/app/shared/services/subject-config.service.ts`
- `getSubjectConfig()` → GET `/api/subject-config`
- `updateSubjectConfig(config)` → PUT `/api/subject-config` (admin only)
- Cache result in a signal: `subjectConfig = signal<SubjectConfig | null>(null)`

**New admin page:** `frontend/src/app/features/settings/subject-config/`
- Route: `/settings/subjects` (admin only)
- Lists current subjects with name, fee, active toggle.
- "Add Subject" button → inline row or dialog with name + fee fields.
- "Save" → calls `PUT /api/subject-config`.

**Student form update:** `frontend/src/app/features/student/components/student-form/`
- Load `SubjectConfig` on init.
- `availableSubjects` = active subjects from config (not hardcoded enum).
- Subject selector: show `SubjectName — ₹fee/subject` in each `<mat-option>`.
- Fee calculation: `totalFee = selectedSubjects.reduce((sum, subjectName) => sum + subjectFeeMap[subjectName], 0) + selfStudyFee`.
- Display a fee breakdown per subject.

**Fee calculator util (frontend):** Rewrite to accept `subjectFees: Record<string, number>` and `selfStudyFee: number` from config.

#### Migration / Seed
- Seed initial `SubjectConfig` doc with existing 3 subjects (Mathematics ₹5000, Science ₹5000, English ₹5000) and selfStudyFee ₹8000.
- Existing students are unaffected (fees already stored on student document).

#### Summary of File Changes

| File | Action |
|------|--------|
| `backend/src/models/subject-config.model.ts` | **Create** |
| `backend/src/modules/subject-config/**` | **Create** (4 files) |
| `backend/src/routes/index.ts` | Register `/subject-config` route |
| `backend/src/utils/fee-calculator.util.ts` | **Update** — accept dynamic fee map |
| `backend/src/modules/student/student.service.ts` | **Update** — fetch SubjectConfig for fee calc |
| `frontend/src/app/shared/models/student.model.ts` | **Update** — remove hardcoded enum (keep for existing UI compat or migrate) |
| `frontend/src/app/shared/utils/fee-calculator.util.ts` | **Update** — dynamic fee map |
| `frontend/src/app/shared/services/subject-config.service.ts` | **Create** |
| `frontend/src/app/features/settings/subject-config/**` | **Create** (component + route) |
| `frontend/src/app/features/student/components/student-form/student-form.component.ts` | **Update** — use SubjectConfig |
| `frontend/src/app/features/student/components/student-form/student-form.component.html` | **Update** — show fee per subject |
| `frontend/src/app/app.routes.ts` | Register settings/subjects route (admin only) |

---

## 5. ✅ Chat Bug — Stale Sender Identity After Login Switch
> UI redesign ✅ done. Bug fix (stale socket auth) ✅ done (4 Apr 2026).

### Current State

**Files:**
- `frontend/src/app/features/classroom/components/classroom-chat/classroom-chat.component.ts`
- `frontend/src/app/shared/services/chat.service.ts`
- `frontend/src/app/features/auth/services/auth.service.ts`
- `frontend/src/app/shared/models/message.model.ts`

#### How Auth Is Stored
```typescript
// auth.service.ts
currentUser = signal<AuthUser | null>(this.loadUserFromStorage());
// On login → localStorage.setItem('yps_user', JSON.stringify(res.data))
// On logout → localStorage.removeItem('yps_user')
```

#### How Sender Identity Works in Chat
```typescript
// classroom-chat.component.ts — plain getters, NOT signals/computed
get currentUserId(): string {
  return this.authService.currentUser()?._id || this.authService.currentUser()?.userId || '';
}
isSentByCurrentUser(message: Message): boolean {
  return message.senderId === this.currentUserId;
}
```

Messages use `{{ message.senderName }}` (stored in the DB at send-time — correct).  
`isSentByCurrentUser()` determines left/right bubble alignment.

#### Root Cause of the Bug
1. User logs in as **admin** and opens chat. Messages are loaded; chat component is active.
2. User logs out → logs in as **faculty/student** (same browser tab, Angular app does NOT fully reinitialise).
3. `authService.currentUser()` signal updates to the new user. ✅
4. **But:** The chat component is likely already destroyed and re-created on navigation — so the messages are re-fetched. However, if the component is **not** destroyed (e.g., navigating back to same classroom), stale messages remain in memory.
5. **More likely root cause:** The socket connection (`chat.service.ts`) was established while logged in as admin. After login switch, the socket may still be authenticated with the old token, causing new incoming messages to carry the **admin's** `senderId`.
6. Without hard refresh, the Socket.IO connection keeps the old auth context, so real-time messages sent after login switch still arrive tagged with the previous user.

### Fix

#### Fix A — Disconnect/Reconnect Socket on Auth Change (Primary Fix)
**File:** `frontend/src/app/shared/services/chat.service.ts`

In the constructor (or via an `effect`), watch `authService.currentUser()`. When it changes (login/logout), disconnect the socket and reconnect with the new token:

```typescript
effect(() => {
  const user = this.authService.currentUser();
  if (user) {
    this.reconnectSocket(); // disconnect old + connect with new token
  } else {
    this.disconnect();
  }
});
```

#### Fix B — Force Chat Component Re-init on Auth Change
**File:** `frontend/src/app/features/classroom/components/classroom-chat/classroom-chat.component.ts`

Add an `effect` that watches `authService.currentUser()` and reloads messages when user changes:

```typescript
effect(() => {
  const user = this.authService.currentUser();
  if (user && this.classroomId()) {
    this.loadMessages(); // re-fetch messages to recalculate isSentByCurrentUser
  }
});
```

#### Fix C — Use Computed Signal for `isSentByCurrentUser` (Supporting Fix)
Convert the plain getter to a signal-based approach so Angular change detection picks up auth changes:

```typescript
// Instead of a plain getter per message, precompute on message list:
messages = computed(() =>
  this.rawMessages().map(msg => ({
    ...msg,
    isMine: msg.senderId === this.authService.currentUser()?._id
  }))
);
```

Use `message.isMine` in the template instead of calling `isSentByCurrentUser(message)`.

#### Fix D — Clear Chat State on Logout (Supporting Fix)
**File:** `frontend/src/app/features/auth/services/auth.service.ts`

On logout, call `chatService.clearState()` to reset loaded messages and disconnect socket.

### Recommended Implementation Order
1. **Fix A** (socket reconnect on auth change) — prevents wrong `senderId` on new messages.
2. **Fix C** (computed signal for `isMine`) — ensures template re-renders correctly when user changes.
3. **Fix B** (reload messages on auth change) — ensures old messages re-evaluate alignment.
4. **Fix D** (clear on logout) — clean housekeeping.

### Summary of File Changes

| File | Change |
|------|--------|
| `frontend/src/app/shared/services/chat.service.ts` | Add `effect` to reconnect socket when `currentUser` changes; add `clearState()` method |
| `frontend/src/app/features/classroom/components/classroom-chat/classroom-chat.component.ts` | Convert `isSentByCurrentUser` to computed signal (`isMine` on each message); add reload effect |
| `frontend/src/app/features/classroom/components/classroom-chat/classroom-chat.component.html` | Use `message.isMine` instead of `isSentByCurrentUser(message)` |
| `frontend/src/app/features/auth/services/auth.service.ts` | Inject `ChatService` and call `clearState()` on logout |

---

## Implementation Order (Recommended)

| Priority | Feature | Status | Effort | Risk |
|----------|---------|--------|--------|------|
| 1 | Chat UI redesign (WhatsApp-style) | ✅ Done | Low | Low |
| 2 | Chat bug fix — stale socket auth after login switch | ✅ Done | Low | Low |
| 3 | Student classroom dropdown | ⬜ Pending | Medium | Low |
| 4 | Subject config admin page + per-subject fees | ⬜ Pending | High | Medium |
| 5 | Faculty form classroom | ✅ Already done | — | — |
| 6 | Classroom list assign | ✅ Already done | — | — |

---

## Quick Reference — Key File Paths

### Student
| File | Purpose |
|------|---------|
| `frontend/src/app/features/student/components/student-form/student-form.component.ts` | Add/edit student form logic |
| `frontend/src/app/features/student/components/student-form/student-form.component.html` | Add/edit student form template |
| `frontend/src/app/features/student/services/student.service.ts` | Frontend student API calls |
| `frontend/src/app/shared/models/student.model.ts` | Student interface + Subject enum |
| `frontend/src/app/shared/utils/fee-calculator.util.ts` | Frontend fee calculation |
| `backend/src/modules/student/student.service.ts` | Backend student creation/update logic |
| `backend/src/utils/fee-calculator.util.ts` | Backend fee calculation |

### Faculty
| File | Purpose |
|------|---------|
| `frontend/src/app/features/faculty/components/faculty-form/faculty-form.component.ts` | Add/edit faculty form logic |
| `frontend/src/app/features/faculty/components/faculty-form/faculty-form.component.html` | Add/edit faculty form template |

### Classroom
| File | Purpose |
|------|---------|
| `frontend/src/app/features/classroom/components/classroom-list/classroom-list.component.ts` | Classroom list (assign actions) |
| `frontend/src/app/features/classroom/components/classroom-list/classroom-list.component.html` | Classroom list template |
| `frontend/src/app/features/classroom/models/classroom.model.ts` | Classroom interface |
| `backend/src/models/classroom.model.ts` | Classroom Mongoose model |

### Chat
| File | Purpose |
|------|---------|
| `frontend/src/app/features/classroom/components/classroom-chat/classroom-chat.component.ts` | Chat UI logic |
| `frontend/src/app/shared/services/chat.service.ts` | Socket.IO + message handling |
| `frontend/src/app/features/auth/services/auth.service.ts` | Auth signal + localStorage |
| `frontend/src/app/shared/models/message.model.ts` | Message interface |

### Subject Config (New)
| File | Purpose |
|------|---------|
| `backend/src/models/subject-config.model.ts` | SubjectConfig Mongoose model (to create) |
| `backend/src/modules/subject-config/` | Full CRUD module (to create) |
| `frontend/src/app/shared/services/subject-config.service.ts` | Config API service (to create) |
| `frontend/src/app/features/settings/subject-config/` | Admin settings page (to create) |
