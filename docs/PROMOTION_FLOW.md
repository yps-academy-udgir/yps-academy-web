# Academic Year Promotion Flow

## Overview

An admin promotes all active students to the next academic year through **Settings → Promote Academic Year**.

---

## Step 1 — Create New Year's Classrooms First

Before promoting, the admin must create classrooms for the new academic year (e.g. `2026-2027`) via the Classrooms module. The promotion will be **blocked** if any required classroom is missing.

---

## Step 2 — Open the Promote Page

Navigate to **Settings → Promote Academic Year** in the sidebar (admin only).

Select the target academic year from the dropdown (e.g. `2026-2027`).

---

## Step 3 — Preview

The page automatically loads a preview by calling:

```
GET /api/academic-year/promotion-preview?newAcademicYear=2026-2027
```

The preview shows:

| Info | What it means |
|---|---|
| **Students to promote** | Active students in classes 5th–9th who will move up one class |
| **Students to graduate** | Active 10th students who will become alumni |
| **Blockers** | Classes that have students to receive but no classroom exists in the new year |

The **Promote** button stays disabled until all blockers are resolved.

---

## Step 4 — Promote

Once the preview shows no blockers, click **Promote to 2026-2027**.

This calls:

```
POST /api/academic-year/promote
Body: { "newAcademicYear": "2026-2027" }
```

---

## What Happens During Promotion

### For students in classes 5th–9th (promoted)

1. Current `academicDetails` (class, classroom, subjects) is saved into the student's `academicHistory[]` array as a permanent record
2. Class is bumped up: `5th → 6th`, `6th → 7th`, …, `9th → 10th`
3. A new classroom is auto-assigned from the new year:
   - Tries to match the **same section** (e.g. student was in `8th-A` → assigned to `9th-A`)
   - Falls back to the **first alphabetical** classroom if no section match

### For students in class 10th (graduated)

1. Current `academicDetails` is saved into `academicHistory[]`
2. Student `status` is set to `alumni`
3. They remain in the database — visible in the student list with the Alumni badge

---

## Academic History Record

Each entry pushed into `academicHistory[]`:

```json
{
  "academicYear": "2025-2026",
  "class": "8th",
  "classroomId": "<ObjectId>",
  "classroomName": "8th-A",
  "subjects": ["Mathematics", "Science", "English"],
  "promotedAt": "2026-04-04T00:00:00.000Z"
}
```

Maximum 6 entries per student (one per class, from 5th to 10th).

---

## Student Status

| Status | Meaning | Badge colour |
|---|---|---|
| `active` | Currently enrolled | Green |
| `alumni` | Completed 10th, graduated | Blue |
| `dropped` | Left mid-year (TC issued etc.) | Red |

Status is visible as a badge in the Student List and can be filtered.

---

## Key Rules

- `yearOfAdmission` — the year a student **first joined** — never changes during promotion
- Self-study students (no classroom) still get their class bumped; no classroom is assigned
- Promotion is **not reversible** via the UI — data integrity relies on `academicHistory[]` as the audit trail
- The same academic year cannot realistically be promoted twice (active students would already be in the new class)
