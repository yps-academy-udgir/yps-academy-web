# Academic Year Promotion & Student History — Implementation Plan

> **Status:** Planning  
> **Scope:** Format standardisation + student status + yearly promotion + history tracking

---

## 1. Current State — Problems to Fix

### 1.1 Inconsistent Year Formats

Two different formats exist for the same concept:

| Field | Location | Current Format | Example |
|---|---|---|---|
| `yearOfAdmission` | Student model, DTO, validation, frontend | `YYYY-YY` | `2026-27` |
| `academicYear` | Classroom model, DTO, validation, frontend | `YYYY-YYYY` | `2026-2027` |

**Resolution:** Standardise everything to `YYYY-YYYY`.  
**Files to change:**
- `backend/src/models/student.model.ts` — regex `^\d{4}-\d{2}$` → `^\d{4}-\d{4}$`
- `backend/src/modules/student/dto/student.dto.ts` — same regex
- `backend/src/middleware/validation.middleware.ts` — fix integer check to string regex
- `frontend/.../student-form.component.ts` — `formatAcademicSession` returns `${y}-${y+1}`

### 1.2 Year Range on Student Form

Currently shows **20 years back** from today. Since the app starts in 2026, only show **2026 onwards** and grow each year automatically.

---

## 2. Student Status Field (New)

Students currently have no lifecycle state. We need:

```ts
export enum StudentStatus {
  ACTIVE  = 'active',   // Currently enrolled, attending
  ALUMNI  = 'alumni',   // Completed 10th, graduated
  DROPPED = 'dropped',  // Left mid-year (TC issued, moved city, etc.)
}
```

**Backend changes:**
- `student.model.ts` — add `status: StudentStatus` (default `active`) to `IStudent` interface and Mongoose schema
- `student.dto.ts` — add optional `status` to update schema (not create — always starts active)

**Frontend changes:**
- `student.model.ts` (frontend shared model) — add `status` field
- `student-list.component` — show a chip/badge per status; filter dropdown gains "Status" option
- `student-detail.component` — display status with ability for admin to manually change (drop/reinstate)

---

## 3. Academic History Tracking

### 3.1 Design Decision

**Chosen approach: Embedded `academicHistory` array inside the student document.**

Rationale:
- Max 6 entries per student (5th → 10th), document never bloats
- One DB read gives complete student picture — no joins
- Simple to query: `student.academicHistory` is always present

**Rejected alternatives:**
- Separate `StudentHistory` collection — overkill for 6 entries per student; adds a join on every detail page
- Immutable year snapshots — too complex, harder to display

### 3.2 New Embedded Schema

```ts
// Added to student model
export interface IAcademicHistoryEntry {
  academicYear: string;          // "2026-2027"
  class: Class;                  // "8th"
  classroomId?: string;          // ObjectId ref to Classroom (optional — selfStudy has none)
  classroomName?: string;        // Denormalised "8th-A" for display even if classroom deleted
  subjects: string[];            // Subjects that year
  promotedAt?: Date;             // When this entry was closed (null = current year)
}
```

**Stored alongside existing `academicDetails` (current year snapshot).**  
`academicDetails` = always reflects the **current** state.  
`academicHistory` = array of **past** year entries, newest first.

### 3.3 What Gets Recorded in History

When promotion runs for academic year `2026-2027 → 2027-2028`:
```
studentA.academicHistory.push({
  academicYear: '2026-2027',
  class: '8th',
  classroomId: '...',
  classroomName: '8th-A',
  subjects: ['Mathematics', 'Science'],
  promotedAt: new Date()
})
studentA.academicDetails.class = '9th'         // bumped
studentA.academicDetails.classroomId = '...'   // new 9th classroom
```

### 3.4 Where History Is Displayed

- **Student Detail page** — new "Academic Journey" tab/section showing a vertical timeline:
  ```
  2027-2028  [current]  9th  |  9th-A
  2026-2027  [promoted] 8th  |  8th-A  → promoted on 1 Apr 2027
  ```
- **Student List** — no change (history not shown in list)

---

## 4. Academic Year Promotion Feature

### 4.1 Flow Overview

```
Admin navigates to Settings → Promote Academic Year
                ↓
System checks: new year classrooms must exist first
  (e.g. 2027-2028 classrooms: 5th-A, 6th-A, 7th-A, 8th-A, 9th-A, 10th-A)
                ↓
Preview screen shows:
  • X active students will be promoted (5th→6th ... 9th→10th)
  • Y 10th students will be marked as alumni
  • Any class with no matching new classroom is flagged (blocked)
                ↓
Admin confirms
                ↓
Backend processes promotion atomically (per-class batch updates)
                ↓
Success summary shown
```

### 4.2 Auto-mapping Rule

For each active student with class `C` and none-zero `classroomId`:
1. Find all classrooms in `newAcademicYear` where `class === nextClass(C)`
2. If exactly 1 → assign automatically
3. If more than 1 → assign the one whose `section` matches the old classroom's `section` (e.g. old `8th-A` → new `9th-A`); if no section match, assign first alphabetically
4. If 0 → **block promotion for that class** until admin creates the classroom

Self-study students (`classroomId = null`) → just bump class, no classroom assignment.

### 4.3 Class Progression

```
5th → 6th → 7th → 8th → 9th → 10th → alumni
```

10th students: `status = 'alumni'`, `academicDetails.class` left as `10th`.

### 4.4 Backend — New Module

```
backend/src/modules/academic-year/
├── dto/academic-year.dto.ts
├── academic-year.repository.ts
├── academic-year.service.ts
├── academic-year.controller.ts
└── academic-year.routes.ts
```

**Endpoints:**

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/academic-year/promotion-preview` | Returns counts + any blocking issues |
| `POST` | `/api/academic-year/promote` | Executes promotion (admin only) |

**`POST /promote` body:**
```json
{ "newAcademicYear": "2027-2028" }
```

**`GET /promotion-preview` query:** `?newAcademicYear=2027-2028`

**Preview response:**
```json
{
  "newAcademicYear": "2027-2028",
  "toPromote": 45,
  "toGraduate": 8,
  "blocked": [
    { "class": "9th", "reason": "No 10th classroom found for 2027-2028" }
  ],
  "canProceed": false
}
```

**Promotion logic (service):**
```ts
// Pseudocode
for each class in ['5th','6th','7th','8th','9th'] {
  const students = await Student.find({ 'academicDetails.class': cls, status: 'active' })
  const nextClass = getNextClass(cls)
  const newClassrooms = await Classroom.find({ class: nextClass, academicYear: dto.newAcademicYear })

  for each student {
    const newRoom = autoMatch(student.classroomId, newClassrooms)
    // snapshot current year into history
    await Student.updateOne({ _id: student._id }, {
      $push: { academicHistory: { ...student.academicDetails, promotedAt: now } },
      $set: {
        'academicDetails.class': nextClass,
        'academicDetails.classroomId': newRoom?._id ?? null,
        'academicDetails.yearOfAdmission': <unchanged — stays as original admission year>
      }
    })
    // update classroom enrollment
  }
}
// Graduate 10th students
await Student.updateMany(
  { 'academicDetails.class': '10th', status: 'active' },
  { $set: { status: 'alumni' }, $push: { academicHistory: { ...currentDetails, promotedAt: now } } }
)
```

> **Note:** `yearOfAdmission` is never changed — it permanently records the year the student first joined the school.

### 4.5 Frontend — Promotion UI

**Location:** `Settings → Promote Academic Year` (admin only)

**Component:** `frontend/src/app/features/settings/promote-academic-year/`

**UX flow:**
1. Input for new academic year (e.g. `2027-2028`) — auto-suggests `currentYear+1`
2. "Check Preview" button → calls `GET /promotion-preview`
3. Preview card shows:
   - ✅ 45 students will be promoted
   - 🎓 8 students will graduate as alumni
   - ❌ Blocked: No 10th classroom for 2027-2028 (create it first)
4. If no blocks → "Promote All Students" button becomes active
5. Confirmation dialog: "This cannot be undone. Are you sure?"
6. Progress indicator while API processes
7. Success summary

**Route:** `/settings/promote`  
**Sidebar:** Under Settings group, admin only — "Promote Academic Year"

---

## 5. Implementation Order

```
Phase 1  ─── Format fix (yearOfAdmission YYYY-YY → YYYY-YYYY)         ✅ COMPLETE
Phase 2  ─── Student status field (model, DTO, schema, frontend model) ✅ COMPLETE
Phase 3  ─── academicHistory embedded array (model only, backward compat) ✅ COMPLETE
Phase 4  ─── Backend academic-year module (preview + promote)          ✅ COMPLETE
Phase 5  ─── Frontend promotion UI page                                ✅ COMPLETE
Phase 6  ─── Student detail — Academic Journey timeline                ⬜ SKIPPED (deferred)
Phase 7  ─── Student list — status badge + filter                      ✅ COMPLETE
```

Phases 1–3 are prerequisites for Phases 4–7. Phases 5–7 can be done in parallel.

### Files created / changed

| File | Change |
|---|---|
| `backend/src/models/student.model.ts` | Added `StudentStatus` enum, `IAcademicHistoryEntry`, `AcademicHistoryEntrySchema`, `status` + `academicHistory` fields |
| `backend/src/modules/student/dto/student.dto.ts` | yearOfAdmission regex YYYY-YYYY |
| `backend/src/middleware/validation.middleware.ts` | Same regex fix |
| `backend/src/modules/academic-year/academic-year.repository.ts` | New — queries, bulkWrite promotion/graduation |
| `backend/src/modules/academic-year/academic-year.service.ts` | New — preview & promote logic |
| `backend/src/modules/academic-year/academic-year.controller.ts` | New — GET promotion-preview, POST promote |
| `backend/src/modules/academic-year/academic-year.routes.ts` | New — admin-only routes |
| `backend/src/modules/academic-year/dto/academic-year.dto.ts` | New — Zod schemas |
| `backend/src/routes/index.ts` | Registered `/academic-year` routes |
| `frontend/src/app/shared/models/student.model.ts` | Added `StudentStatus`, `AcademicHistoryEntry`, `status` + `academicHistory` to `Student`; added `selectedStatus` to `FilterState` |
| `frontend/src/app/shared/services/academic-year.service.ts` | New — HTTP service wrapping preview + promote endpoints |
| `frontend/src/app/features/settings/promote-year/` | New — 3 files (ts/html/scss) |
| `frontend/src/app/features/settings/settings.routes.ts` | Added `promote-year` route |
| `frontend/src/app/core/layout/sidebar/sidebar.component.ts` | Added "Promote Academic Year" sidebar link |
| `frontend/src/app/shared/components/filter-bar/filter-bar.component.*` | Added `statusOptions` input + `selectedStatus` signal + filter chip |
| `frontend/src/app/features/student/components/student-list/student-list.component.*` | Added status column, badge, filter |

---

## 6. Open Questions / Decisions Made

| # | Question | Decision |
|---|---|---|
| 1 | What happens to 10th students after promotion? | Marked as `alumni`, kept in DB |
| 2 | Classroom assignment — manual or auto? | Auto-map by section match, fallback to first alphabetical |
| 3 | Self-study students? | Just bump class, no classroomId assignment |
| 4 | Should historical years still be viewable? | Yes — student detail shows full timeline |
| 5 | Can promotion be reversed? | No — it is irreversible; admin must check preview before confirming |
| 6 | `yearOfAdmission` changes on promotion? | No — it always reflects the original admission year |

---

## 7. Backward Compatibility

- Existing students with no `status` field → MongoDB `$exists` or default to `active` in reads
- Existing students with no `academicHistory` → treated as empty array
- No existing data migrations needed — all new fields are optional with safe defaults
