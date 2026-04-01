# Backend Architecture — YPS Academy

> **Last updated:** April 2026  
> **Scope:** `backend/src/` — full refactor from flat controllers/routes to modular layered architecture

---

## Table of Contents

1. [Overview](#overview)
2. [What Changed](#what-changed)
3. [Folder Structure](#folder-structure)
4. [Architecture Layers](#architecture-layers)
5. [Module Reference](#module-reference)
6. [API Route Reference](#api-route-reference)
7. [Key Technical Notes](#key-technical-notes)
8. [Adding a New Module](#adding-a-new-module)

---

## Overview

The backend was refactored from a **flat layout** (all controllers in one folder, all routes in another) to a **modular layered architecture** inspired by NestJS but using plain Express + TypeScript.

Each feature lives entirely inside its own folder under `src/modules/<feature>/`, containing its own DTO, Repository, Service, Controller, and Routes files.

**No external dependencies were added.** All existing middleware, models, and utilities remain unchanged.

---

## What Changed

### Files Added

| File | Purpose |
|------|---------|
| `src/modules/student/dto/student.dto.ts` | Zod validation schemas for student operations |
| `src/modules/student/student.repository.ts` | All Mongoose queries for Student |
| `src/modules/student/student.service.ts` | Student business logic |
| `src/modules/student/student.controller.ts` | HTTP handlers for student routes |
| `src/modules/student/student.routes.ts` | Express router for `/api/students` |
| `src/modules/faculty/dto/faculty.dto.ts` | Zod schemas for faculty operations |
| `src/modules/faculty/faculty.repository.ts` | All Mongoose queries for Faculty |
| `src/modules/faculty/faculty.service.ts` | Faculty business logic |
| `src/modules/faculty/faculty.controller.ts` | HTTP handlers for faculty routes |
| `src/modules/faculty/faculty.routes.ts` | Express router for `/api/faculty` |
| `src/modules/classroom/dto/classroom.dto.ts` | Zod schemas for classroom + schedule + assignments |
| `src/modules/classroom/classroom.repository.ts` | All Mongoose queries for Classroom |
| `src/modules/classroom/classroom.service.ts` | Classroom business logic |
| `src/modules/classroom/classroom.controller.ts` | HTTP handlers for classroom routes |
| `src/modules/classroom/classroom.routes.ts` | Express router for `/api/classrooms` |
| `src/modules/attendance/dto/attendance.dto.ts` | Zod schemas for bulk attendance |
| `src/modules/attendance/attendance.repository.ts` | Mongoose queries + `bulkWrite` upsert |
| `src/modules/attendance/attendance.service.ts` | Attendance business logic |
| `src/modules/attendance/attendance.controller.ts` | HTTP handlers for attendance routes |
| `src/modules/attendance/attendance.routes.ts` | Express router for `/api/attendance` |
| `src/modules/exam-result/dto/exam-result.dto.ts` | Zod schemas for exam results (migrated from `src/schemas/`) |
| `src/modules/exam-result/exam-result.repository.ts` | Mongoose queries for ExamResult |
| `src/modules/exam-result/exam-result.service.ts` | Exam result business logic |
| `src/modules/exam-result/exam-result.controller.ts` | HTTP handlers for exam-result routes |
| `src/modules/exam-result/exam-result.routes.ts` | Express router for `/api/exam-results` |
| `src/modules/auth/dto/auth.dto.ts` | Zod schema for login |
| `src/modules/auth/auth.service.ts` | JWT auth logic |
| `src/modules/auth/auth.controller.ts` | HTTP handlers for auth routes |
| `src/modules/auth/auth.routes.ts` | Express router for `/api/auth` |
| `src/modules/log/log.controller.ts` | HTTP handler for client-side log ingestion |
| `src/modules/log/log.routes.ts` | Express router for `/api/logs` |

### Files Updated

| File | Change |
|------|--------|
| `src/routes/index.ts` | All route imports updated to point to `../modules/<feature>/<feature>.routes` |
| `src/app.ts` | `logRoutes` import updated to `./modules/log/log.routes` |

### Files Deleted

| File/Folder | Reason |
|-------------|--------|
| `src/controllers/student.controller.ts` | Moved into `src/modules/student/` |
| `src/controllers/faculty.controller.ts` | Moved into `src/modules/faculty/` |
| `src/controllers/classroom.controller.ts` | Moved into `src/modules/classroom/` |
| `src/controllers/attendance.controller.ts` | Moved into `src/modules/attendance/` |
| `src/controllers/exam-result.controller.ts` | Moved into `src/modules/exam-result/` |
| `src/controllers/auth.controller.ts` | Moved into `src/modules/auth/` |
| `src/controllers/log.controller.ts` | Moved into `src/modules/log/` |
| `src/routes/student.routes.ts` | Moved into `src/modules/student/` |
| `src/routes/faculty.routes.ts` | Moved into `src/modules/faculty/` |
| `src/routes/classroom.routes.ts` | Moved into `src/modules/classroom/` |
| `src/routes/attendance.routes.ts` | Moved into `src/modules/attendance/` |
| `src/routes/exam-result.routes.ts` | Moved into `src/modules/exam-result/` |
| `src/routes/auth.routes.ts` | Moved into `src/modules/auth/` |
| `src/routes/log.routes.ts` | Moved into `src/modules/log/` |
| `src/schemas/exam-result.schema.ts` | Migrated into `src/modules/exam-result/dto/exam-result.dto.ts` |

### Files Unchanged (intentionally)

These files were **not modified** — they are shared infrastructure used by all modules:

```
src/models/               ← All Mongoose models (student, faculty, classroom, attendance, exam-result, auth)
src/middleware/           ← auth, error, request-logger, upload, validation middleware
src/utils/                ← fee-calculator, logger, response, seed-auth utilities
src/config/               ← database config
src/types/                ← Express type extensions
```

---

## Folder Structure

```
backend/src/
├── app.ts                          # Express app setup, registers route prefixes
├── server.ts                       # HTTP server entry point
│
├── config/
│   └── database.config.ts          # MongoDB connection
│
├── middleware/                     # Shared Express middleware (unchanged)
│   ├── auth.middleware.ts          # JWT verifyToken
│   ├── error.middleware.ts         # Global error handler
│   ├── request-logger.middleware.ts
│   ├── upload.middleware.ts        # Multer config
│   └── validation.middleware.ts    # Zod validation wrapper
│
├── models/                         # Mongoose models (unchanged)
│   ├── attendance.model.ts
│   ├── auth.model.ts
│   ├── classroom.model.ts
│   ├── exam-result.model.ts
│   ├── faculty.model.ts
│   └── student.model.ts
│
├── modules/                        # ← NEW: all feature modules live here
│   ├── README.md
│   ├── student/
│   │   ├── dto/
│   │   │   └── student.dto.ts      # Zod schemas + inferred TS types
│   │   ├── student.repository.ts   # Mongoose queries only
│   │   ├── student.service.ts      # Business logic
│   │   ├── student.controller.ts   # Request/response handling
│   │   └── student.routes.ts       # Express Router
│   ├── faculty/
│   │   ├── dto/
│   │   │   └── faculty.dto.ts
│   │   ├── faculty.repository.ts
│   │   ├── faculty.service.ts
│   │   ├── faculty.controller.ts
│   │   └── faculty.routes.ts
│   ├── classroom/
│   │   ├── dto/
│   │   │   └── classroom.dto.ts
│   │   ├── classroom.repository.ts
│   │   ├── classroom.service.ts
│   │   ├── classroom.controller.ts
│   │   └── classroom.routes.ts
│   ├── attendance/
│   │   ├── dto/
│   │   │   └── attendance.dto.ts
│   │   ├── attendance.repository.ts
│   │   ├── attendance.service.ts
│   │   ├── attendance.controller.ts
│   │   └── attendance.routes.ts
│   ├── exam-result/
│   │   ├── dto/
│   │   │   └── exam-result.dto.ts
│   │   ├── exam-result.repository.ts
│   │   ├── exam-result.service.ts
│   │   ├── exam-result.controller.ts
│   │   └── exam-result.routes.ts
│   ├── auth/
│   │   ├── dto/
│   │   │   └── auth.dto.ts
│   │   ├── auth.service.ts
│   │   ├── auth.controller.ts
│   │   └── auth.routes.ts
│   └── log/
│       ├── log.controller.ts
│       └── log.routes.ts
│
├── routes/
│   └── index.ts                    # Aggregates all module routers, kept as single entry point
│
├── types/
│   └── express/
│       └── index.d.ts              # Extends Express Request with user & file fields
│
└── utils/                          # Shared utilities (unchanged)
    ├── fee-calculator.util.ts
    ├── logger.ts
    ├── response.util.ts
    └── seed-auth.util.ts
```

---

## Architecture Layers

Each module follows a strict 4-layer pipeline:

```
HTTP Request
     │
     ▼
┌─────────────┐
│   Routes    │  Registers Express router, applies middleware (auth, upload, validate)
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Controller │  Parses request, calls service, sends response via response.util.ts
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Service   │  Business logic — uniqueness checks, fee calculations, cross-entity rules
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Repository  │  All Mongoose queries — no business logic, returns plain documents
└──────┬──────┘
       │
       ▼
┌─────────────┐
│    Model    │  Mongoose schema (src/models/ — shared, never module-specific)
└─────────────┘
```

### Layer Responsibilities

| Layer | Responsibility | Imports |
|-------|---------------|---------|
| **DTO** | Zod schemas + `z.infer<>` TypeScript types | `zod` only |
| **Repository** | Mongoose CRUD + aggregation queries | Model, TS types |
| **Service** | Business rules, validation, cross-entity checks | Repository, Model, Utils |
| **Controller** | HTTP parsing, service delegation, response formatting | Service, DTO, `response.util` |
| **Routes** | Router definition, middleware application | Controller, Middleware |

---

## Module Reference

### Student Module

**DTO exports:** `createStudentSchema`, `updateStudentSchema`, `addPaymentSchema`, `CreateStudentDto`, `UpdateStudentDto`, `AddPaymentDto`

**Repository methods:**

| Method | Description |
|--------|-------------|
| `findAll(query)` | Paginated list with search/filter support |
| `findById(id)` | Find by ID (lean, plain object) |
| `findByEmail(email)` | Duplicate email check |
| `create(data)` | Insert new student |
| `update(id, data)` | Update by ID |
| `delete(id)` | Delete by ID |
| `findByIdDoc(id)` | Find full Mongoose document (for in-place updates) |
| `getStats()` | Aggregation: total, active, inactive counts |
| `getFeesSummary()` | Aggregation: fee collection summary |
| `getFeeDefaulters()` | Aggregation: students with overdue fees |

**Service methods:** `getAll`, `getById`, `create`, `update`, `delete`, `addPayment`, `getStats`, `getFeesSummary`, `getFeeDefaulters`

---

### Faculty Module

**DTO exports:** `createFacultySchema`, `updateFacultySchema`, `addSalaryPaymentSchema`

**Repository methods:** `findAll`, `findById`, `findByEmail`, `create`, `update`, `delete`, `findByIdDoc`, `getStats`

**Service methods:** `getAll`, `getById`, `create`, `update`, `delete`, `addSalaryPayment`, `getStats`

---

### Classroom Module

**DTO exports:** `createClassroomSchema`, `updateClassroomSchema`, `assignFacultySchema`, `enrollStudentSchema`, `updateScheduleSchema`

**Repository methods:** `findAll`, `findById`, `findDuplicate`, `findByIdWithSchedule`, `create`, `update`, `delete`, `getStats`

**Service methods:** `getAll`, `getById`, `create`, `update`, `delete`, `assignFaculty`, `removeFaculty`, `enrollStudent`, `removeStudent`, `getSchedule`, `updateSchedule`, `getStats`

---

### Attendance Module

**DTO exports:** `bulkAttendanceSchema`, `BulkAttendanceDto`

**Repository methods:**

| Method | Description |
|--------|-------------|
| `bulkUpsert(records)` | Mongoose `bulkWrite` — upsert by classroomId + studentId + date |
| `findByClassroom(classroomId, date)` | All attendance for a classroom on a date |
| `findByStudent(studentId, query)` | All attendance for a student (date-range filterable) |
| `getSummaryByClassroom(classroomId)` | Aggregation: present/absent counts per student |

**Service methods:** `getByClassroom`, `getByStudent`, `getSummary`, `bulkSave`

---

### Exam-Result Module

**DTO exports:** `createExamResultSchema`, `updateExamResultSchema`, `bulkExamResultSchema`

**Repository methods:** `findAll`, `findById`, `findByClassroom`, `findFiltered`, `create`, `update`, `delete`, `bulkCreate`

**Service methods:** `getAll`, `getById`, `getByClassroom`, `getFiltered`, `create`, `update`, `delete`, `bulkCreate`

> Note: `getFiltered` builds a student→classroom map before querying, enabling cross-classroom result queries.

---

### Auth Module

**DTO exports:** `loginSchema`, `LoginDto`

No repository — service queries the `User` model directly (appropriate for auth).

**Service methods:** `login`, `verifyToken`

---

### Log Module

No DTO, repository, or service — controller directly calls `logger.log()` for client-side log ingestion.

---

## API Route Reference

All routes are prefixed through `src/routes/index.ts`. Base URL: `/api`

### Students — `/api/students`

| Method | Path | Auth | Body/Params |
|--------|------|------|-------------|
| `GET` | `/stats/overview` | ✅ | — |
| `GET` | `/fees/summary` | ✅ | — |
| `GET` | `/fees/defaulters` | ✅ | — |
| `GET` | `/` | ✅ | Query: `page`, `limit`, `search`, `status` |
| `GET` | `/:id` | ✅ | Param: `id` |
| `POST` | `/` | ✅ | `CreateStudentDto` + optional `image` file |
| `PUT` | `/:id` | ✅ | `UpdateStudentDto` + optional `image` file |
| `DELETE` | `/:id` | ✅ | Param: `id` |
| `POST` | `/:id/payments` | ✅ | `AddPaymentDto` |

### Faculty — `/api/faculty`

| Method | Path | Auth | Body/Params |
|--------|------|------|-------------|
| `GET` | `/stats/overview` | ✅ | — |
| `GET` | `/` | ✅ | Query: `page`, `limit`, `search` |
| `GET` | `/:id` | ✅ | Param: `id` |
| `POST` | `/` | ✅ | `CreateFacultyDto` + optional `image` file |
| `PUT` | `/:id` | ✅ | `UpdateFacultyDto` + optional `image` file |
| `DELETE` | `/:id` | ✅ | Param: `id` |
| `POST` | `/:id/payments` | ✅ | `AddSalaryPaymentDto` |

### Classrooms — `/api/classrooms`

| Method | Path | Auth | Body/Params |
|--------|------|------|-------------|
| `GET` | `/stats/overview` | ✅ | — |
| `GET` | `/` | ✅ | — |
| `GET` | `/:id` | ✅ | Param: `id` |
| `POST` | `/` | ✅ | `CreateClassroomDto` |
| `PUT` | `/:id` | ✅ | `UpdateClassroomDto` |
| `DELETE` | `/:id` | ✅ | Param: `id` |
| `POST` | `/:id/faculty` | ✅ | `AssignFacultyDto` |
| `DELETE` | `/:id/faculty/:facultyId` | ✅ | Params: `id`, `facultyId` |
| `POST` | `/:id/students` | ✅ | `EnrollStudentDto` |
| `DELETE` | `/:id/students/:studentId` | ✅ | Params: `id`, `studentId` |
| `GET` | `/:id/schedule` | ✅ | Param: `id` |
| `PUT` | `/:id/schedule` | ✅ | `UpdateScheduleDto` |

### Attendance — `/api/attendance`

| Method | Path | Auth | Body/Params |
|--------|------|------|-------------|
| `POST` | `/bulk` | ✅ | `BulkAttendanceDto` |
| `GET` | `/summary` | ✅ | Query: `classroomId` |
| `GET` | `/students/:id` | ✅ | Param: `id`; Query: `from`, `to` |
| `GET` | `/` | ✅ | Query: `classroomId`, `date` |

### Exam Results — `/api/exam-results`

| Method | Path | Auth | Body/Params |
|--------|------|------|-------------|
| `POST` | `/bulk` | ✅ | `BulkExamResultDto` |
| `GET` | `/classroom/:classroomId` | ✅ | Param: `classroomId` |
| `GET` | `/filter` | ✅ | Query: `studentId`, `examType`, `subject` |
| `GET` | `/` | ✅ | — |
| `GET` | `/:id` | ✅ | Param: `id` |
| `POST` | `/` | ✅ | `CreateExamResultDto` |
| `PUT` | `/:id` | ✅ | `UpdateExamResultDto` |
| `DELETE` | `/:id` | ✅ | Param: `id` |

### Auth — `/api/auth`

| Method | Path | Auth | Body |
|--------|------|------|------|
| `POST` | `/login` | ❌ | `LoginDto` |
| `GET` | `/verify` | ✅ | — |

### Logs — `/api/logs`

| Method | Path | Auth | Body |
|--------|------|------|------|
| `POST` | `/client` | ❌ | `{ level, message, data? }` |

---

## Key Technical Notes

### Zod v4 Syntax (Important)

This project uses **Zod v4**, which has breaking changes from v3:

```typescript
// ❌ Zod v3 — DO NOT USE
z.string({ required_error: 'Required', errorMap: () => ({ message: 'Invalid' }) })

// ✅ Zod v4 — USE THIS
z.string({ error: 'Field is required or invalid' })
// or with a function
z.string({ error: (issue) => issue.input === undefined ? 'Required' : 'Invalid' })
```

### `serviceError` Pattern

Services use a lightweight helper to attach HTTP status codes to errors:

```typescript
function serviceError(message: string, statusCode: number): Error {
  const err = new Error(message) as Error & { statusCode: number };
  err.statusCode = statusCode;
  return err;
}
```

Controllers then detect these:

```typescript
} catch (error: unknown) {
  if (error instanceof Error && (error as any).statusCode) {
    return sendError(res, (error as any).statusCode, error.message);
  }
  next(error); // bubble to global error middleware
}
```

### `response.util.ts` Helpers

All responses go through these helpers — never send raw `res.json()`:

```typescript
sendSuccess(res, data, message?, statusCode?)   // 200/201 success
sendError(res, statusCode, message)             // 4xx client errors
sendPaginated(res, data, total, page, limit)    // paginated list responses
```

### `validation.middleware.ts`

Wrap any Zod schema to validate `req.body` before the controller runs:

```typescript
router.post('/', verifyToken, validate(createStudentSchema), controller.create);
```

Errors are forwarded as `ZodError` to the global error middleware which formats them.

---

## Adding a New Module

Follow these steps to add a new feature module (example: `fee`):

### 1. Create the folder structure

```
src/modules/fee/
├── dto/
│   └── fee.dto.ts
├── fee.repository.ts
├── fee.service.ts
├── fee.controller.ts
└── fee.routes.ts
```

### 2. Define DTOs (`fee.dto.ts`)

```typescript
import { z } from 'zod';

export const createFeeSchema = z.object({
  amount: z.number({ error: 'Amount is required' }),
  studentId: z.string({ error: 'Student ID is required' }),
});

export type CreateFeeDto = z.infer<typeof createFeeSchema>;
```

### 3. Create the Repository (`fee.repository.ts`)

```typescript
import Fee from '../../models/fee.model';
import { CreateFeeDto } from './dto/fee.dto';

export const feeRepository = {
  async findAll() { return Fee.find().lean(); },
  async create(data: CreateFeeDto) { return Fee.create(data); },
  // ...
};
```

### 4. Create the Service (`fee.service.ts`)

```typescript
import { feeRepository } from './fee.repository';

function serviceError(message: string, statusCode: number) {
  const err = new Error(message) as Error & { statusCode: number };
  err.statusCode = statusCode;
  return err;
}

export const feeService = {
  async create(data: CreateFeeDto) {
    // business logic here
    return feeRepository.create(data);
  },
};
```

### 5. Create the Controller (`fee.controller.ts`)

```typescript
import { Request, Response, NextFunction } from 'express';
import { feeService } from './fee.service';
import { sendSuccess, sendError } from '../../utils/response.util';

export const feeController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await feeService.create(req.body);
      sendSuccess(res, result, 'Fee created', 201);
    } catch (error: unknown) {
      if (error instanceof Error && (error as any).statusCode) {
        return sendError(res, (error as any).statusCode, error.message);
      }
      next(error);
    }
  },
};
```

### 6. Create the Router (`fee.routes.ts`)

```typescript
import { Router } from 'express';
import { verifyToken } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validation.middleware';
import { createFeeSchema } from './dto/fee.dto';
import { feeController } from './fee.controller';

const router = Router();
router.get('/', verifyToken, feeController.getAll);
router.post('/', verifyToken, validate(createFeeSchema), feeController.create);
export default router;
```

### 7. Register in `src/routes/index.ts`

```typescript
import feeRoutes from '../modules/fee/fee.routes';
// ...
router.use('/fees', feeRoutes);
```

### 8. Create the Mongoose Model (if new entity)

Add `src/models/fee.model.ts` following the existing model patterns.

### Checklist

- [ ] DTO file with Zod v4 schemas and inferred types
- [ ] Repository with Mongoose queries only (no business logic)
- [ ] Service with business logic using `serviceError` for HTTP errors
- [ ] Controller delegating to service and using `response.util.ts`
- [ ] Routes registered with `verifyToken` and `validate()` where appropriate
- [ ] Route registered in `src/routes/index.ts`
- [ ] TypeScript compiles with zero errors (`npx tsc --noEmit` in `backend/`)
