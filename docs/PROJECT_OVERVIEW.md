# YPS Academy Web — Project Overview

## Tech Stack

### Frontend

| Technology | Version | Purpose |
|---|---|---|
| Angular | 20 | SPA framework — standalone components, signals, `@if`/`@for` syntax |
| Angular Material | 19 | UI component library (tables, dialogs, menus, forms, navigation) |
| TypeScript | 5.x | Strongly-typed JavaScript across the entire frontend |
| SCSS | — | Component-level and global styling; custom theme variables |
| RxJS | 7.x | Reactive HTTP calls, `Observable` streams, `tap`/`catchError`/`finalize` operators |
| Angular Signals | 20 | Reactive state management (`signal()`, `computed()`, `effect()`) |
| Angular PWA | 20 | Service worker for offline support, caching, and "Add to Home Screen" |
| Socket.IO Client | 4.x | Real-time classroom chat over WebSocket |
| Web Push (browser) | — | Receiving push notifications from backend |
| Angular Router | 20 | Lazy-loaded feature routes, route guards, breadcrumb data |

### Backend

| Technology | Version | Purpose |
|---|---|---|
| Node.js | 20 LTS | JavaScript runtime for the API server |
| Express | 4.x | HTTP server framework — routing, middleware pipeline |
| TypeScript | 5.x | Strongly-typed Node.js backend |
| MongoDB | 7.x | NoSQL document database for all app data |
| Mongoose | 8.x | ODM — schema definitions, model validation, DB queries |
| Socket.IO | 4.x | WebSocket server for real-time classroom chat |
| JSON Web Token (JWT) | 9.x | Stateless authentication — sign on login, verify on every request |
| bcrypt | 5.x | Secure password hashing |
| Zod | 3.x | Schema-based request body validation (DTOs) |
| Multer | 1.x | Multipart file upload handling (student/faculty profile images) |
| Web Push (npm) | 3.x | Sending push notifications to subscribed browsers |
| Morgan / custom | — | HTTP request logging middleware |

### DevOps & Tooling

| Technology | Purpose |
|---|---|
| Docker | Containerise frontend and backend for consistent environments |
| Docker Compose | Multi-container local dev (`docker-compose.dev.yml`) and production (`docker-compose.prod.yml`) |
| Render | Cloud hosting for the backend Node.js API (`render.yaml`) |
| Vercel | Frontend deployment with automatic builds from Git |
| Nginx | Serve the Angular production build inside the frontend Docker container |
| ESLint / TSConfig | TypeScript strict mode, linting rules across both apps |

---

## Folder Structure

### Backend: `backend/src/`

```
backend/src/
├── app.ts                        # Express setup (middleware stack, route registration)
├── server.ts                     # Entry point — starts HTTP + Socket.IO server
│
├── config/
│   ├── database.config.ts        # MongoDB connection & initialization
│   └── socket.config.ts          # WebSocket (Socket.IO) setup
│
├── middleware/
│   ├── auth.middleware.ts        # JWT verify + role-based access (requireRoles)
│   ├── error.middleware.ts       # Global error handler (validation errors, 404, 500)
│   ├── validation.middleware.ts  # ObjectId check + input sanitization
│   ├── upload.middleware.ts      # Image uploads (multer config)
│   └── request-logger.middleware.ts  # HTTP request logging
│
├── models/                       # Mongoose database schemas
│   ├── auth.model.ts             # Login accounts (userId, role, passwordHash, isFirstLogin)
│   ├── student.model.ts          # Students (profile, fees, status, academic history)
│   ├── faculty.model.ts          # Faculty (profile, salary)
│   ├── classroom.model.ts        # Classes (students, faculty assignments, schedule)
│   ├── exam-result.model.ts      # Exam marks per student per subject
│   ├── attendance.model.ts       # Daily attendance records
│   ├── message.model.ts          # Chat messages
│   ├── notification.model.ts     # Push + in-app notifications
│   ├── subject-config.model.ts   # Subjects & fees per class level
│   └── sequence-counter.model.ts # Auto-increment counters (roll numbers)
│
├── utils/
│   ├── generate-user-id.util.ts     # e.g. 26-YPS-STU-ALEX-001
│   ├── generate-roll-number.util.ts # Sequential roll number per class
│   ├── fee-calculator.util.ts       # Fee calculation with discounts
│   ├── response.util.ts             # Standard JSON response wrapper
│   ├── auth-user.util.ts            # Auth user helper functions
│   ├── seed-auth.util.ts            # Seed initial admin user on first run
│   └── logger.ts                    # Centralized logging utility
│
├── routes/
│   └── index.ts                  # Main router — registers all module routes
│
└── modules/                      # One folder per feature domain
    ├── auth/                     # Login, logout, password change, seed users
    ├── student/                  # CRUD + status change + fee payments
    ├── faculty/                  # CRUD + salary payments
    ├── classroom/                # CRUD + enrollment + schedule management
    ├── exam-result/              # Marks entry & retrieval
    ├── attendance/               # Bulk mark attendance & reports
    ├── chat/                     # Store & broadcast classroom messages
    ├── notification/             # Web push + in-app notification inbox
    ├── subject-config/           # Subjects & fee rates per class level
    ├── academic-year/            # Year-end student promotions
    └── log/                      # Audit logs (admin only)
```

Each module follows the same 4-file pattern:

```
module/
├── module.routes.ts       # URL paths + who can access (admin / faculty / student)
├── module.controller.ts   # Read request → call service → send response
├── module.service.ts      # Business rules & validation
└── module.repository.ts   # Raw MongoDB queries
```

---

### Frontend: `frontend/src/app/`

```
app/
├── app.config.ts          # Bootstrap: providers, interceptors, router setup
├── app.routes.ts          # Top-level routing (lazy-loads each feature)
│
├── core/                  # App-wide singletons (loaded once)
│   ├── guards/
│   │   ├── auth.guard.ts          # Redirect to /login if not authenticated
│   │   ├── guest.guard.ts         # Redirect away from /login if already logged in
│   │   ├── first-login.guard.ts   # Force password change on first login
│   │   └── role.guard.ts          # Block route if wrong role
│   ├── interceptors/
│   │   └── http.interceptor.ts    # Auto-attach JWT token to every HTTP request
│   ├── services/
│   │   ├── theme.service.ts       # Dark/light theme switching
│   │   ├── socket.service.ts      # WebSocket connection (real-time chat)
│   │   ├── notification.service.ts
│   │   ├── pwa-update.service.ts  # Service worker update detection
│   │   └── pwa-install.service.ts # "Add to home screen" prompt
│   └── layout/
│       ├── header/                # Top bar (logo, user menu, theme toggle)
│       ├── sidebar/               # Nav menu (links change based on role)
│       └── main-layout/           # Wrapper: header + sidebar + breadcrumbs
│
├── features/              # One folder per screen / domain
│   ├── auth/              # Login page, change-password
│   ├── dashboard/         # Stats overview (students, fees, classrooms)
│   ├── student/           # List, detail, form, marks, fees, my-profile
│   ├── faculty/           # List, detail, form, salary receipts
│   ├── classroom/         # List, detail, chat, attendance, marks entry, schedule
│   ├── results/           # Exam result entry & view
│   ├── settings/          # Subject config, academic year promotion (admin)
│   ├── notifications/     # Send broadcast notifications (admin)
│   └── website/           # Public marketing landing page (no auth needed)
│
└── shared/                # Reused across all features
    ├── components/        # Dialogs, filter-bar, loading spinner, breadcrumbs, receipts
    ├── services/          # API call services (student, faculty, classroom, etc.)
    └── models/            # TypeScript interfaces matching backend models
```

---

## How It All Works

### High-Level Flow

```
Browser (Angular)
    │
    ├── Guards check: logged in? correct role?
    │       └── No → redirect to /login
    │
    ├── HTTP Interceptor attaches JWT token to every outgoing request
    │
    ├── Service makes API call (e.g. GET /api/students)
    │       └── Component receives data via Signal → UI re-renders automatically
    │
    └── Socket.IO channel handles real-time classroom chat separately

                    ↕  REST API (JSON)

Express (Node.js Backend)
    │
    ├── auth.middleware     → verify JWT, attach user to request
    ├── validation.middleware → check ObjectId, sanitize input
    │
    └── Router → Controller → Service → Repository → MongoDB
                    │              │          └── Raw DB query
                    │              └── Business rules (validate, calculate fees, etc.)
                    └── Format response using response.util.ts
```

### Authentication Flow

1. User enters `userId`, `password`, `role` on the login page
2. Backend verifies credentials → issues a JWT token
3. Frontend stores token → HTTP interceptor attaches it as `Authorization: Bearer <token>` on every request
4. Backend `auth.middleware` verifies the token on every protected route
5. On first login, user is forced to change their password before accessing the app

### Student Lifecycle

```
Admin creates student
    → System generates unique ID (e.g. 26-YPS-STU-ALEX-001)
    → Assign to one or more classrooms
    → Faculty marks attendance & enters exam marks
    → Admin records fee payments
    → Student can view own marks, fees, schedule
    → Year-end: Admin promotes batch → history archived → students move to next class
```

### Classroom Operations

```
Admin creates classroom (e.g. "8th-A")
    → Assign faculty by subject (Math → Mr. Sharma, Science → Ms. Patel)
    → Enroll students
    → Faculty members:
        ├── Mark daily attendance
        ├── Enter exam marks
        └── Chat with students in real-time
    → Students can view schedule, results, and chat
```

---

## User Roles & Access

| Feature | Admin | Faculty | Student |
|---|---|---|---|
| Manage students (CRUD) | ✅ | ❌ | ❌ |
| View student list | ✅ | ✅ | ❌ |
| Mark attendance | ✅ | ✅ (own class) | ❌ |
| Enter marks | ✅ | ✅ (own class) | ❌ |
| View own marks/fees | — | — | ✅ |
| Manage faculty (CRUD) | ✅ | ❌ | ❌ |
| Manage classrooms | ✅ | ❌ | ❌ |
| Classroom chat | ✅ | ✅ | ✅ |
| Subject config / settings | ✅ | ❌ | ❌ |
| Academic year promotion | ✅ | ❌ | ❌ |
| Send push notifications | ✅ | ❌ | ❌ |
| Public website | 🌐 Everyone | | |

---

## Key Data Relationships

```
SubjectConfig (per class level: 8, 9, 10...)
    └── defines: subjects available + fee rates

Classroom
    ├── links to → Faculty (one per subject)
    ├── links to → Students (enrolled list)
    └── has a weekly schedule

Student
    ├── belongs to → one or more Classrooms
    ├── has fee records calculated from SubjectConfig
    ├── status: active | alumni | dropped
    └── academicHistory: archived snapshots from each year

ExamResult
    └── scoped to: Student + Classroom + Subject + Month/Year

Attendance
    └── scoped to: Student + Classroom + Subject + Date
    (only active students appear in attendance/marks entry)
```

---

## Student Status

| Status | Meaning | Appears in attendance/marks? |
|---|---|---|
| `active` | Currently enrolled | ✅ Yes |
| `dropped` | Left mid-year | ❌ No |
| `alumni` | Graduated / completed | ❌ No |

> Default filter: the backend returns only `active` students unless `?status=all` is passed.

---

## API Base Routes

| Route | Module |
|---|---|
| `POST /api/auth/login` | Authentication |
| `GET/POST /api/students` | Student management |
| `PATCH /api/students/:id/status` | Update student status |
| `GET/POST /api/faculty` | Faculty management |
| `GET/POST /api/classrooms` | Classroom management |
| `GET/POST /api/attendance` | Attendance |
| `GET/POST /api/exam-results` | Exam results / marks |
| `GET/POST /api/chat/:classroomId` | Classroom chat |
| `GET/POST /api/notifications` | Push notifications |
| `GET/PUT /api/subject-config` | Subject & fee config |
| `POST /api/academic-year/promote` | Year-end promotion |

---

## Code Standards

### File & Folder Naming

| Type | Convention | Example |
|---|---|---|
| Components | `kebab-case.component.ts` | `student-list.component.ts` |
| Services | `kebab-case.service.ts` | `student.service.ts` |
| Models | `kebab-case.model.ts` | `student.model.ts` |
| Guards | `kebab-case.guard.ts` | `auth.guard.ts` |
| Routes file | `kebab-case.routes.ts` | `student.routes.ts` |
| DTOs | `kebab-case.dto.ts` | `student.dto.ts` |
| Utilities | `kebab-case.util.ts` | `fee-calculator.util.ts` |
| SCSS partials | `_name.scss` (underscore prefix) | `_variables.scss`, `_theme.scss` |
| Classes / Components | `PascalCase` | `StudentListComponent` |
| Signals, methods, variables | `camelCase` | `selectedClass`, `filteredStudents` |
| Route constant arrays | `SCREAMING_SNAKE_CASE` | `STUDENT_ROUTES` |

---

### Frontend: Angular Component

Every component follows this exact structure:

```typescript
@Component({
  selector: 'app-feature-name',
  standalone: true,                                    // Always standalone — no NgModules
  imports: [CommonModule, SharedMaterialModule, ...],
  templateUrl: './feature-name.component.html',
  styleUrls: ['./feature-name.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,     // Always OnPush
})
export class FeatureNameComponent implements OnInit {
  // 1. Services — always inject(), never constructor parameters
  private router = inject(Router);
  private studentService = inject(StudentService);
  private dialog = inject(MatDialog);
  roleService = inject(RoleService);  // public if referenced in template

  // 2. Signals — all local state
  loading = signal<boolean>(false);
  error   = signal<string | null>(null);
  student = signal<Student | null>(null);

  // 3. Computed — derived state, never duplicated manually
  filteredStudents = computed(() =>
    this.students().filter(s => /* logic */)
  );

  // 4. Effects — side effects only (toasts, logging), never data derivation
  constructor() {
    effect(() => {
      if (this.error()) this.notificationService.error(this.error()!);
    });
  }

  // 5. Lifecycle
  ngOnInit(): void {
    this.loadData();
  }

  // 6. Public event handlers — named on<Action>()
  onEdit(): void { }
  onDelete(): void { }

  // 7. Private helpers — always at the bottom
  private loadData(): void { }
}
```

---

### Frontend: Service Structure

```typescript
@Injectable({ providedIn: 'root' })
export class StudentService {
  private http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/students`;

  // Service owns its state as signals
  students      = signal<Student[]>([]);
  loading       = signal<boolean>(false);
  error         = signal<string | null>(null);
  totalStudents = signal<number>(0);

  hasStudents = computed(() => this.students().length > 0);

  // Methods return Observable AND update signals via tap()
  getAllStudents(page = 1, limit = 10): Observable<PaginatedResponse<Student>> {
    this.loading.set(true);
    this.error.set(null);

    return this.http.get<PaginatedResponse<Student>>(this.API_URL).pipe(
      tap((res) => {
        this.students.set(res.data);
        this.totalStudents.set(res.pagination.total);
      }),
      catchError((err) => this.handleError(err)),
      finalize(() => this.loading.set(false))    // always runs — reset loading
    );
  }

  updateStudent(id: string, data: Partial<Student>): Observable<ApiResponse<Student>> {
    return this.http.put<ApiResponse<Student>>(`${this.API_URL}/${id}`, data).pipe(
      tap((res) => {
        if (res.data) {
          this.students.update(list =>
            list.map(s => s._id === id ? res.data! : s)  // .update() for mutations
          );
        }
      }),
      catchError((err) => this.handleError(err)),
      finalize(() => this.loading.set(false))
    );
  }

  deleteStudent(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.API_URL}/${id}`).pipe(
      tap(() => {
        this.students.update(list => list.filter(s => s._id !== id));
        this.totalStudents.update(n => n - 1);
      }),
      catchError((err) => this.handleError(err)),
      finalize(() => this.loading.set(false))
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    const msg = error.error?.details || error.error?.error || error.error?.message || error.message;
    this.error.set(msg);
    return throwError(() => new Error(msg));
  }
}
```

**Rules:**
- Use `signal.set()` for full replacements, `signal.update()` for array mutations
- Always `tap()` → `catchError()` → `finalize()` in that order
- Never use `res.json()` style; let `tap` update signals and return the Observable

---

### Frontend: Routing

```typescript
export const FEATURE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/list/list.component').then(m => m.ListComponent),
    data: { title: 'Feature List' },           // Required — drives breadcrumbs
  },
  {
    path: 'add',
    loadComponent: () =>
      import('./components/form/form.component').then(m => m.FormComponent),
    canActivate: [roleGuard(UserRole.ADMIN)],   // Role-specific guard
    data: { title: 'Add Feature' },
  },
  {
    path: ':id/edit',
    loadComponent: () =>
      import('./components/form/form.component').then(m => m.FormComponent),
    data: { title: 'Edit Feature' },
  },
];
```

**Rules:**
- Every route must have `data: { title: '...' }` for breadcrumbs
- Always lazy-load with `loadComponent` or `loadChildren`
- Routes under `MainLayoutComponent` automatically get header + sidebar + breadcrumbs
- Use `roleGuard(UserRole.X)` for role-restricted routes

---

### Frontend: Template Conventions

```html
<!-- Use @if / @for / @else — NEVER *ngIf or *ngFor -->
@if (loading()) {
  <app-loading />
}

@if (!loading() && students().length > 0) {
  @for (student of pagedStudents(); track student._id) {
    <tr>...</tr>
  }
}

<!-- Signal values always called as functions in templates -->
<span>{{ student()?.firstName }}</span>
<button [disabled]="loading()">Save</button>

<!-- Role-based UI -->
@if (roleService.isAdmin()) {
  <button mat-menu-item (click)="onDelete()">Delete</button>
}
```

**Rules:**
- `@if` / `@for` / `@else` only — never `*ngIf` / `*ngFor`
- Always track by `_id`: `@for (item of list(); track item._id)`
- Signals in templates are always called: `student()`, never `student`
- Use `| titlecase`, `| date` pipes for display formatting

---

### Backend: Controller Pattern

```typescript
// Controllers are plain exported async functions — never classes
export const createStudent = async (req: Request, res: Response): Promise<void> => {
  try {
    // 1. Validate with Zod
    const parsed = createStudentSchema.safeParse(req.body);
    if (!parsed.success) {
      errorResponse(res, 'Validation failed', 400,
        parsed.error.issues.map(i => i.message).join(', '));
      return;
    }

    // 2. Call service
    const result = await studentService.create(parsed.data, req.file);

    // 3. Respond
    successResponse(res, result, 'Student created successfully', 201);
  } catch (error: any) {
    if (error.statusCode) {                        // custom service error
      errorResponse(res, error.message, error.statusCode);
      return;
    }
    if (error.name === 'ValidationError') {        // Mongoose schema error
      errorResponse(res, 'Validation failed', 400,
        Object.values(error.errors).map((e: any) => e.message).join(', '));
      return;
    }
    errorResponse(res, 'Failed to create student', 500, error.message);
  }
};
```

**Rules:**
- Controllers are exported `async` functions, never classes
- Always wrap in `try/catch`
- Validate with `schema.safeParse()` before calling the service
- Check `error.statusCode` first (set by `serviceError()`)
- Never use `res.json()` directly — always use `successResponse` / `errorResponse` / `paginatedResponse`

---

### Backend: Service Pattern

```typescript
// Services are plain exported objects — never classes
export const studentService = {
  async getAll(filter: StudentFilter, pagination: PaginationOptions) {
    return studentRepository.findAll(filter, pagination);
  },

  async getById(id: string) {
    const student = await studentRepository.findById(id);
    if (!student) throw serviceError('Student not found', 404);
    return student;
  },

  async create(data: CreateStudentDto, file?: Express.Multer.File) {
    const existing = await studentRepository.findByEmail(data.email);
    if (existing) throw serviceError('Email already registered', 409);
    return studentRepository.create(data);
  },
};
```

**Rules:**
- Plain exported object, not a class
- Throw `serviceError(message, statusCode)` for business rule violations
- No `req` / `res` access — pure business logic only
- All DB access goes through the repository

---

### Backend: Repository Pattern

```typescript
// Repositories are plain exported objects — never classes
export const studentRepository = {
  async findAll(filter: StudentFilter, { page, limit }: PaginationOptions) {
    const query: Record<string, any> = {};
    if (filter.search) {
      query['$or'] = [
        { firstName: { $regex: filter.search, $options: 'i' } },
        { lastName:  { $regex: filter.search, $options: 'i' } },
      ];
    }
    query['status'] = filter.status ?? 'active';  // default active-only

    const skip = (page - 1) * limit;
    const [students, total] = await Promise.all([
      Student.find(query).skip(skip).limit(limit).lean(),
      Student.countDocuments(query),
    ]);
    return { students, total };
  },

  async findById(id: string) {
    return Student.findById(id).lean();
  },

  async updateStatus(id: string, status: string) {
    return Student.findByIdAndUpdate(id, { status }, { new: true, runValidators: true }).lean();
  },
};
```

**Rules:**
- Plain exported object, not a class
- Always use `.lean()` on reads — returns plain objects, not Mongoose documents
- Parallel queries use `Promise.all([data query, count query])`
- No business logic — only DB operations

---

### Backend: DTO / Validation (Zod)

```typescript
import { z } from 'zod';

export const createStudentSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50),
  email:     z.string().email('Invalid email address'),
  contact:   z.string().regex(/^\d{10}$/, 'Contact must be 10 digits'),
  gender:    z.enum(['male', 'female', 'other']),
  academicDetails: z.object({
    class:           z.enum(['8', '9', '10', '11', '12']),
    yearOfAdmission: z.string().regex(/^\d{4}-\d{4}$/, 'Format: YYYY-YYYY'),
  }),
});

export const updateStudentSchema = createStudentSchema.partial(); // all fields optional

export type CreateStudentDto = z.infer<typeof createStudentSchema>;
export type UpdateStudentDto = z.infer<typeof updateStudentSchema>;
```

**Rules:**
- Always use Zod — never manual `if (!req.body.field)` checks
- Export both the schema and the inferred TypeScript type (`z.infer<>`)
- Use `.partial()` for update DTOs
- Error messages in Zod must be user-facing strings

---

### Backend: API Response Format

All responses use `response.util.ts` helpers — never `res.json()` directly:

```typescript
// Success
successResponse(res, data, 'Message', 201);
// → { success: true, data: {...}, message: 'Message' }

// Error
errorResponse(res, 'Not found', 404);
errorResponse(res, 'Validation failed', 400, 'detail string');
// → { success: false, error: 'Not found', details?: '...' }

// Paginated list
paginatedResponse(res, students, { total, page, limit, pages }, 'Retrieved');
// → { success: true, data: [...], pagination: {...}, message: '...' }
```

---

### SCSS Conventions

```scss
// BEM naming: block, block__element, block--modifier
.student-list { }
.student-list__header { }
.student-list--compact { }

// Status badges follow status-<value> pattern
.status-badge { }
.status-active  { background: rgba(76, 175, 80, 0.15); color: #4caf50; }
.status-dropped { background: rgba(244, 67, 54, 0.15); color: #f44336; }
.status-alumni  { background: rgba(33, 150, 243, 0.15); color: #2196f3; }

// Always use design tokens from _variables.scss — never hardcode
.card {
  padding: var(--spacing-lg);
  border-radius: var(--border-radius-md);
  color: var(--text-primary);
  background: var(--surface-color);
}

// Responsive breakpoints
@media (max-width: 768px) { .hide-mobile { display: none; } }
@media (max-width: 480px) { .hide-small  { display: none; } }
```

**Rules:**
- One `.scss` file per component
- Use CSS custom properties from `_variables.scss` for all colours, spacing, radii
- Never use `::ng-deep` unless absolutely unavoidable
- Status classes: `status-active`, `status-dropped`, `status-alumni`
